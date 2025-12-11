import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus } from './request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { User } from '../users/user.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Crear una nueva solicitud de booking
   */
  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    const { artistId, requesterId, eventDate, eventLocation, eventType, offeredPrice, message } = createRequestDto;

    // Validar que el artista existe
    const artist = await this.usersRepository.findOne({
      where: { user_id: artistId },
    });
    if (!artist) {
      throw new NotFoundException('El artista no existe.');
    }

    // Validar que el solicitante existe
    const requester = await this.usersRepository.findOne({
      where: { user_id: requesterId },
    });
    if (!requester) {
      throw new NotFoundException('El solicitante no existe.');
    }

    // Crear y guardar la solicitud
    const request = this.requestsRepository.create({
      artist,
      requester,
      eventDate,
      eventLocation,
      eventType,
      offeredPrice,
      message,
      status: RequestStatus.PENDIENTE,
    });

    return this.requestsRepository.save(request);
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

