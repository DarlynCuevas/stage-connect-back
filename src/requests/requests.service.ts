
import { Offer } from './offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Request, RequestStatus, ClosedBy } from './request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { User } from '../users/user.entity';
import { ArtistProfile } from '../users/artist-profile.entity';
import { RequestsGateway } from './requests.gateway';
import { BlockedDay } from '../blocked-days/blocked-day.entity';
import { BlockedDaysService } from '../blocked-days/blocked-days.service';
import { ContractService } from '../contracts/contract.service';
import { Interested } from '../interested.entity';

@Injectable()
export class RequestsService {

    /**
     * Obtener todas las solicitudes del usuario logueado (artista, local, promotor, manager) y sanitizarlas
     */
    async getUserRequestsSanitized(currentUserId: number, userRole: string) {
      let requests: Request[] = [];
      if (userRole === 'Artista') {
        requests = await this.findByArtistUserId(currentUserId);
      } else if (userRole === 'Local' || userRole === 'Promotor') {
        requests = await this.findBySenderUserId(currentUserId);
      } else if (userRole === 'Manager') {
        requests = await this.findByManagerId(currentUserId);
      }

      // Sanitizar artist y requester en cada request
      const sanitizeUser = async (user: any) => {
        if (!user) return user;
        const { password, passwordHash, password_hash, email, ...rest } = user;
        let basePrice: number | undefined = undefined;
        if (user.role === 'Artista' && user.user_id) {
          const profile = await this.artistProfileRepository.findOne({ where: { user_id: user.user_id } });
          basePrice = profile?.basePrice;
        }
        return { ...rest, basePrice };
      };

      // Mapear y sanitizar usuarios de forma asíncrona, asegurando que artist.basePrice siempre esté presente
      return Promise.all(requests.map(async req => {
        const artist = await sanitizeUser(req.artist);
        const requester = await sanitizeUser(req.requester);
        return {
          ...req,
          artist,
          requester,
        };
      }));
    }
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ArtistProfile)
    private readonly artistProfileRepository: Repository<ArtistProfile>,
    @InjectRepository(BlockedDay)
    private readonly blockedDayRepository: Repository<BlockedDay>,
    @InjectRepository(Interested)
    private readonly interestedRepository: Repository<Interested>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly requestsGateway: RequestsGateway,
    private readonly blockedDaysService: BlockedDaysService,
    private readonly contractService: ContractService,
  ) {}

  /**
   * Obtener todas las solicitudes confirmadas de un venue (solo las aceptadas)
   */
  async findConfirmedByVenueId(venueUserId: number): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        requester: {
          user_id: venueUserId,
        },
        status: RequestStatus.ACEPTADA,
      },
      relations: ['artist', 'requester'],
      order: {
        eventDate: 'ASC',
      },
    });
  }

  /**
   * Crear una nueva solicitud de booking
   */
  async create(createRequestDto: CreateRequestDto, currentUserId: number): Promise<Request> {
    const { artistId, eventDate, eventLocation, eventType, offeredPrice, message, horaInicio, horaFin } = createRequestDto;

    const parsedEventDate = new Date(eventDate);
    console.log('[CREATE SOLICITUD] eventDate recibido:', eventDate, '-> parsed:', parsedEventDate);
    if (isNaN(parsedEventDate.getTime())) {
      throw new BadRequestException('Fecha de evento inválida.');
    }


    // Validar que no exista ya una solicitud pendiente para el mismo artista, requester y fecha
    const existingPending = await this.requestsRepository.findOne({
      where: {
        artist: { user_id: artistId },
        requester: { user_id: currentUserId },
        eventDate: parsedEventDate,
        status: RequestStatus.PENDIENTE,
      },
      relations: ['artist', 'requester'],
    });
    if (existingPending) {
      throw new BadRequestException('Ya existe una solicitud pendiente para este artista y fecha.');
    }

    if (!currentUserId) {
      throw new ForbiddenException('Usuario no autenticado.');
    }

    // Validar que el artista existe
    const artist = await this.usersRepository.findOne({
      where: { user_id: artistId },
    });
    if (!artist) {
      throw new NotFoundException('El artista no existe.');
    }

    // Validar que el solicitante existe
    const requester = await this.usersRepository.findOne({
      where: { user_id: currentUserId },
    });
    if (!requester) {
      throw new NotFoundException('El solicitante no existe.');
    }

    // parsedEventDate ya declarado arriba

    // Validar que el venue (si el requester es Local) no tenga el día bloqueado
    if (requester.role === 'Local') {
      const blockedDays = await this.blockedDayRepository.find({
        where: {
          artist: { user_id: requester.user_id },
          blockedDate: parsedEventDate,
        },
      });
      if (blockedDays.length > 0) {
        throw new BadRequestException('El local no está disponible en la fecha seleccionada.');
      }
    }

    // Validar que el artista no tenga el día bloqueado
    const artistBlockedDays = await this.blockedDayRepository.find({
      where: {
        artist: { user_id: artist.user_id },
        blockedDate: parsedEventDate,
      },
    });
    if (artistBlockedDays.length > 0) {
      throw new BadRequestException('El artista no está disponible en la fecha seleccionada.');
    }

    // Crear y guardar la solicitud
      const request = this.requestsRepository.create({
        artist,
        requester,
        eventDate: parsedEventDate,
        horaInicio,
        horaFin,
        eventLocation,
        eventType,
        offeredPrice,
        message,
        nombreLocal: createRequestDto.nombreLocal,
        ciudadLocal: createRequestDto.ciudadLocal,
        status: RequestStatus.PENDIENTE,
      });

    const saved = await this.requestsRepository.save(request);

    // Get artist profile for managerId
    const artistProfile = await this.artistProfileRepository.findOne({
      where: { user_id: artist.user_id },
    });

    // Emitir evento en tiempo real al artista
    this.requestsGateway.emitRequestCreated({
      id: saved.id,
      artistId: artist.user_id,
      managerId: artistProfile?.managerId,
      requesterId: requester.user_id,
      eventDate: saved.eventDate?.toString?.() || String(saved.eventDate),
      eventLocation: saved.eventLocation,
      eventType: saved.eventType,
      offeredPrice: Number(saved.offeredPrice),
      message: saved.message,
      status: saved.status,
      createdAt: saved.createdAt?.toISOString?.(),
    });

    return saved;
  }

  /**
   * Obtener todas las solicitudes para un artista (por su user_id)
   */
  async findByArtistUserId(artistUserId: number): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        artist: {
          user_id: artistUserId,
        },
      },
      relations: ['artist', 'requester'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Obtener una solicitud por ID
   */
  async findOne(id: number): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['artist', 'requester'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada.');
    }

    return request;
  }

  /**
   * Actualizar el estado de una solicitud
   * Solo el artista puede cambiar el estado
   * Solo se pueden cambiar solicitudes en estado PENDIENTE
   */
  async updateStatus(
    requestId: number,
    statusDto: UpdateRequestStatusDto,
    currentUserId: number,
  ): Promise<Request> {
    const request = await this.findOne(requestId);

    // Get artist profile to check managerId
    const artistProfile = await this.artistProfileRepository.findOne({
      where: { user_id: request.artist.user_id },
    });

    // Validar que el usuario autenticado es el artista, su manager o el requester (Local)
    const artistOwnerId = request.artist.user_id;
    const artistManagerId = artistProfile?.managerId;
    const isArtist = artistOwnerId === currentUserId;
    const isManager = artistManagerId && artistManagerId === currentUserId;
    const isRequester = request.requester?.user_id === currentUserId;

    if (!isArtist && !isManager && !isRequester) {
      throw new ForbiddenException('No tienes permiso para modificar esta solicitud.');
    }

    // Validar que la solicitud está en estado PENDIENTE
    if (request.status !== RequestStatus.PENDIENTE) {
      throw new BadRequestException('Solo se pueden cambiar solicitudes en estado PENDIENTE.');
    }


    // Actualizar el estado y quién cierra
    request.status = statusDto.status;
    if (statusDto.status === RequestStatus.ACEPTADA) {
      if (isArtist) {
        request.closed_by = ClosedBy.ARTIST;
      } else if (isManager) {
        request.closed_by = ClosedBy.MANAGER;
      }
      // Log para verificar la fecha antes de crear el día bloqueado
      console.log('[PATCH SOLICITUD] Crear día bloqueado:', {
        artistId: request.artist.user_id,
        eventDate: request.eventDate,
        eventDateType: typeof request.eventDate,
      });
      await this.blockedDaysService.create(request.artist.user_id, request.eventDate);
      // --- NUEVO: Actualizar interesados ---
      // Convertir la fecha a string YYYY-MM-DD para comparar con Interested
      const eventDateStr = request.eventDate instanceof Date
        ? request.eventDate.toISOString().slice(0, 10)
        : String(request.eventDate);
      // 1. Aceptar el interesado del artista seleccionado
      const acceptedInterested = await this.interestedRepository.findOne({
        where: {
          artistId: request.artist.user_id,
          venueId: request.requester.user_id,
          date: eventDateStr,
          status: 'interested',
        },
      });
      if (acceptedInterested) {
        acceptedInterested.status = 'accepted';
        await this.interestedRepository.save(acceptedInterested);
      }
      // 2. Expirar los demás interesados de la misma oferta
      await this.interestedRepository
        .createQueryBuilder()
        .update()
        .set({ status: 'expired' })
        .where('venueId = :venueId', { venueId: request.requester.user_id })
        .andWhere('date = :date', { date: eventDateStr })
        .andWhere('artistId != :artistId', { artistId: request.artist.user_id })
        .andWhere('status IN (:...statuses)', { statuses: ['pending', 'interested'] })
        .execute();
      // --- FIN NUEVO ---
      // Generar contrato PDF
      try {
        await this.contractService.generateContractPdf(request.id);
        console.log('[CONTRATO] Contrato PDF generado para request', request.id);
        // Recargar el request para obtener la URL actualizada
        const updatedRequest = await this.requestsRepository.findOne({ where: { id: request.id } });
        if (updatedRequest) {
          request.contractPdfUrl = updatedRequest.contractPdfUrl;
        }
      } catch (err) {
        console.error('[CONTRATO] Error generando contrato PDF:', err);
      }
    }
    const saved = await this.requestsRepository.save(request);

    // Emitir evento de actualización a artista y manager
    this.requestsGateway.emitRequestUpdated({
      id: saved.id,
      artistId: saved.artist.user_id,
      managerId: artistProfile?.managerId || undefined,
      status: saved.status,
      updatedAt: saved.updatedAt?.toISOString?.(),
    });

    return saved;
  }

  /**
   * Obtener todas las solicitudes confirmadas de un artista (solo las aceptadas)
   */
  async findConfirmedByArtistId(artistUserId: number): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        artist: {
          user_id: artistUserId,
        },
        status: RequestStatus.ACEPTADA,
      },
      relations: ['artist', 'requester'],
      order: {
        eventDate: 'ASC',
      },
    });
  }

  /**
   * Obtener todas las solicitudes enviadas por un usuario (local/promotor)
   */
  async findBySenderUserId(requesterUserId: number): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        requester: {
          user_id: requesterUserId,
        },
      },
      relations: ['artist', 'requester', 'offers'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Obtener todas las solicitudes para los artistas de un manager
   */
  async findByManagerId(managerId: number): Promise<Request[]> {
    // Primero obtener todos los perfiles de artistas del manager
    const artistProfiles = await this.artistProfileRepository.find({
      where: {
        managerId: managerId,
      },
    });

    if (artistProfiles.length === 0) {
      return [];
    }

    const artistIds = artistProfiles.map(p => p.user_id);

    // Obtener todas las solicitudes para estos artistas
    return this.requestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.artist', 'artist')
      .leftJoinAndSelect('request.requester', 'requester')
      .where('artist.user_id IN (:...artistIds)', { artistIds })
      .orderBy('request.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Obtener estadísticas para un manager
   */
  async getManagerStats(managerId: number): Promise<{
    pendingRequests: number;
    eventsThisMonth: number;
    totalRevenue: number;
  }> {
    console.log('🔍 [getManagerStats] Manager ID:', managerId, 'Type:', typeof managerId);
    
    // Obtener perfiles de artistas del manager
    const artistProfiles = await this.artistProfileRepository.find({
      where: { managerId: Number(managerId) },
    });

    console.log('🎨 [getManagerStats] Artist profiles found:', artistProfiles.length);

    if (artistProfiles.length === 0) {
      console.log('⚠️ [getManagerStats] No artists found for manager');
      return {
        pendingRequests: 0,
        eventsThisMonth: 0,
        totalRevenue: 0,
      };
    }

    const artistIds = artistProfiles.map(p => p.user_id);
    console.log('🎯 [getManagerStats] Artist IDs:', artistIds);

    // Solicitudes pendientes - usar query builder para mayor visibilidad
    const pendingRequestsQuery = await this.requestsRepository
      .createQueryBuilder('request')
      .leftJoin('request.artist', 'artist')
      .where('artist.user_id IN (:...artistIds)', { artistIds })
      .andWhere('request.status = :status', { status: RequestStatus.PENDIENTE })
      .getMany();
    
    const pendingRequests = pendingRequestsQuery.length;
    console.log('📊 [getManagerStats] Pending requests count:', pendingRequests);
    console.log('📊 [getManagerStats] Pending requests details:', pendingRequestsQuery.map(r => ({ 
      id: r.id, 
      artistId: r.artist?.user_id, 
      status: r.status,
      eventType: r.eventType 
    })));

    // Eventos este mes (aceptados)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const eventsThisMonth = await this.requestsRepository.count({
      where: {
        artist: { user_id: In(artistIds) },
        status: RequestStatus.ACEPTADA,
        eventDate: Between(startOfMonth, endOfMonth),
      },
    });

    // Ingresos generados (suma de offeredPrice de eventos aceptados)
    const revenueResult = await this.requestsRepository
      .createQueryBuilder('request')
      .innerJoin('request.artist', 'artist')
      .select('SUM(request.offeredPrice)', 'total')
      .where('artist.user_id IN (:...artistIds)', { artistIds })
      .andWhere('request.status = :status', { status: RequestStatus.ACEPTADA })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    console.log('💰 [getManagerStats] Total revenue:', totalRevenue);

    return {
      pendingRequests,
      eventsThisMonth,
      totalRevenue,
    };
  }
    async createOffer(requestId: number, dto: CreateOfferDto, userId: number): Promise<Offer> {
      const request = await this.requestsRepository.findOne({ where: { id: requestId }, relations: ['offers'] });
      if (!request) throw new NotFoundException('Request not found');
      const user = await this.usersRepository.findOne({ where: { user_id: userId } });
      if (!user) throw new NotFoundException('User not found');

      // Si la solicitud no está aceptada ni rechazada, ponerla en estado NEGOCIANDO
      if (request.status !== RequestStatus.ACEPTADA && request.status !== RequestStatus.RECHAZADA) {
        request.status = RequestStatus.NEGOCIANDO;
        await this.requestsRepository.save(request);
      }

      const offer = this.offerRepository.create({
        request,
        user,
        amount: dto.amount,
        type: dto.type,
        message: dto.message,
      });
      return this.offerRepository.save(offer);
    }

  async getOffers(requestId: number): Promise<Offer[]> {
    const request = await this.requestsRepository.findOne({ where: { id: requestId }, relations: ['offers'] });
    if (!request) throw new NotFoundException('Request not found');
    return request.offers;
  }
}

