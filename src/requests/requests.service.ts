import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Request, RequestStatus, ClosedBy } from './request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { User } from '../users/user.entity';
import { ArtistProfile } from '../users/artist-profile.entity';
import { RequestsGateway } from './requests.gateway';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ArtistProfile)
    private readonly artistProfileRepository: Repository<ArtistProfile>,
    private readonly requestsGateway: RequestsGateway,
  ) {}

  /**
   * Crear una nueva solicitud de booking
   */
  async create(createRequestDto: CreateRequestDto, currentUserId: number): Promise<Request> {
    const { artistId, eventDate, eventLocation, eventType, offeredPrice, message } = createRequestDto;

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

    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate.getTime())) {
      throw new BadRequestException('Fecha de evento inválida.');
    }

    // Crear y guardar la solicitud
    const request = this.requestsRepository.create({
      artist,
      requester,
      eventDate: parsedEventDate,
      eventLocation,
      eventType,
      offeredPrice,
      message,
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

    // Validar que el usuario autenticado es el artista o su manager
    const artistOwnerId = request.artist.user_id;
    const artistManagerId = artistProfile?.managerId;
    const isArtist = artistOwnerId === currentUserId;
    const isManager = artistManagerId && artistManagerId === currentUserId;

    if (!isArtist && !isManager) {
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
      relations: ['artist', 'requester'],
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
}

