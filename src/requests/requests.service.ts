import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus } from './request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { User } from '../users/user.entity';
import { RequestsGateway } from './requests.gateway';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

    // Emitir evento en tiempo real al artista
    this.requestsGateway.emitRequestCreated({
      id: saved.id,
      artistId: artist.user_id,
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

    // Validar que el usuario autenticado es el artista
    if (request.artist.user_id !== currentUserId) {
      throw new ForbiddenException('No tienes permiso para modificar esta solicitud.');
    }

    // Validar que la solicitud está en estado PENDIENTE
    if (request.status !== RequestStatus.PENDIENTE) {
      throw new BadRequestException('Solo se pueden cambiar solicitudes en estado PENDIENTE.');
    }

    // Actualizar el estado
    request.status = statusDto.status;
    return this.requestsRepository.save(request);
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
}

