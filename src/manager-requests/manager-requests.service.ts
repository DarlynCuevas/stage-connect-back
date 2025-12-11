import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagerRequest, ManagerRequestStatus } from './manager-request.entity';
import { CreateManagerRequestDto } from './dto/create-manager-request.dto';
import { UpdateManagerRequestStatusDto } from './dto/update-manager-request-status.dto';
import { User } from '../users/user.entity';
import { ManagerRequestsGateway } from './manager-requests.gateway';

@Injectable()
export class ManagerRequestsService {
  constructor(
    @InjectRepository(ManagerRequest)
    private readonly managerRequestsRepository: Repository<ManagerRequest>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly managerRequestsGateway: ManagerRequestsGateway,
  ) {}

  /**
   * Crear una nueva solicitud manager-artista
   */
  async create(createDto: CreateManagerRequestDto, currentUserId: number): Promise<ManagerRequest> {
    const { receiverId, message } = createDto;

    // Validar que el sender existe
    const sender = await this.usersRepository.findOne({
      where: { user_id: currentUserId },
    });
    if (!sender) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // Validar que el receiver existe
    const receiver = await this.usersRepository.findOne({
      where: { user_id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('Destinatario no encontrado.');
    }

    // Validar que uno es Manager y otro es Artista
    const validCombination = 
      (sender.role === 'Manager' && receiver.role === 'Artista') ||
      (sender.role === 'Artista' && receiver.role === 'Manager');

    if (!validCombination) {
      throw new BadRequestException('Solo se pueden enviar solicitudes entre Manager y Artista.');
    }

    // Si el sender es artista, validar que no tenga manager
    if (sender.role === 'Artista' && sender.managerId) {
      throw new BadRequestException('Ya tienes un manager asignado.');
    }

    // Verificar que no exista una solicitud pendiente entre estos usuarios
    const existingRequest = await this.managerRequestsRepository.findOne({
      where: [
        { sender: { user_id: currentUserId }, receiver: { user_id: receiverId }, status: ManagerRequestStatus.PENDIENTE },
        { sender: { user_id: receiverId }, receiver: { user_id: currentUserId }, status: ManagerRequestStatus.PENDIENTE },
      ],
    });

    if (existingRequest) {
      throw new BadRequestException('Ya existe una solicitud pendiente entre estos usuarios.');
    }

    // Crear y guardar la solicitud
    const request = this.managerRequestsRepository.create({
      sender,
      receiver,
      message,
      status: ManagerRequestStatus.PENDIENTE,
    });

    const saved = await this.managerRequestsRepository.save(request);

    this.managerRequestsGateway.emitManagerRequestCreated({
      id: saved.id,
      senderId: sender.user_id,
      senderName: sender.name,
      senderRole: sender.role,
      receiverId: receiver.user_id,
      receiverRole: receiver.role,
      message: saved.message,
      status: saved.status,
      createdAt: saved.createdAt?.toISOString?.(),
    });

    return saved;
  }

  /**
   * Obtener solicitudes recibidas por el usuario actual
   */
  async findReceived(userId: number): Promise<ManagerRequest[]> {
    return this.managerRequestsRepository.find({
      where: {
        receiver: { user_id: userId },
      },
      relations: ['sender', 'receiver'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Obtener solicitudes enviadas por el usuario actual
   */
  async findSent(userId: number): Promise<ManagerRequest[]> {
    return this.managerRequestsRepository.find({
      where: {
        sender: { user_id: userId },
      },
      relations: ['sender', 'receiver'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Actualizar el estado de una solicitud (aceptar/rechazar)
   */
  async updateStatus(
    requestId: number,
    statusDto: UpdateManagerRequestStatusDto,
    currentUserId: number,
  ): Promise<ManagerRequest> {
    const request = await this.managerRequestsRepository.findOne({
      where: { id: requestId },
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada.');
    }

    // Validar que el usuario actual es el receiver
    if (request.receiver.user_id !== currentUserId) {
      throw new ForbiddenException('No tienes permiso para modificar esta solicitud.');
    }

    // Validar que la solicitud está en estado PENDIENTE
    if (request.status !== ManagerRequestStatus.PENDIENTE) {
      throw new BadRequestException('Solo se pueden cambiar solicitudes en estado PENDIENTE.');
    }

    // Si se acepta, establecer la relación manager-artista
    if (statusDto.status === ManagerRequestStatus.ACEPTADA) {
      let artistUser: User;
      let managerId: number;

      if (request.sender.role === 'Manager') {
        artistUser = request.receiver;
        managerId = request.sender.user_id;
      } else {
        artistUser = request.sender;
        managerId = request.receiver.user_id;
      }

      // Verificar nuevamente que el artista no tenga manager
      const currentArtist = await this.usersRepository.findOne({
        where: { user_id: artistUser.user_id },
      });

      if (currentArtist?.managerId) {
        throw new BadRequestException('El artista ya tiene un manager asignado.');
      }

      // Asignar manager al artista
      await this.usersRepository.update(
        { user_id: artistUser.user_id },
        { managerId: managerId }
      );
    }

    // Actualizar el estado
    request.status = statusDto.status;
    const saved = await this.managerRequestsRepository.save(request);

    this.managerRequestsGateway.emitManagerRequestUpdated({
      id: saved.id,
      senderId: saved.sender.user_id,
      receiverId: saved.receiver.user_id,
      status: saved.status,
      updatedAt: saved.updatedAt?.toISOString?.(),
    });

    return saved;
  }

  /**
   * Eliminar una solicitud enviada por el usuario actual (solo si está pendiente)
   */
  async deleteSentRequest(requestId: number, currentUserId: number): Promise<{ message: string }> {
    const request = await this.managerRequestsRepository.findOne({
      where: { id: requestId },
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada.');
    }

    if (request.sender.user_id !== currentUserId) {
      throw new ForbiddenException('No puedes eliminar esta solicitud.');
    }

    if (request.status !== ManagerRequestStatus.PENDIENTE) {
      throw new BadRequestException('Solo puedes eliminar solicitudes pendientes.');
    }

    await this.managerRequestsRepository.delete(requestId);

    this.managerRequestsGateway.emitManagerRequestDeleted({
      id: requestId,
      senderId: request.sender.user_id,
      receiverId: request.receiver.user_id,
    });

    return { message: 'Solicitud eliminada correctamente.' };
  }

  /**
   * Eliminar todas las solicitudes pendientes enviadas por el usuario actual
   */
  async deleteAllSentRequests(currentUserId: number): Promise<{ deleted: number }> {
    const pendingRequests = await this.managerRequestsRepository.find({
      where: {
        sender: { user_id: currentUserId },
        status: ManagerRequestStatus.PENDIENTE,
      },
      relations: ['sender', 'receiver'],
    });

    if (!pendingRequests.length) {
      return { deleted: 0 };
    }

    const ids = pendingRequests.map((req) => req.id);

    await this.managerRequestsRepository.delete(ids);

    pendingRequests.forEach((req) => {
      this.managerRequestsGateway.emitManagerRequestDeleted({
        id: req.id,
        senderId: req.sender.user_id,
        receiverId: req.receiver.user_id,
      });
    });

    return { deleted: ids.length };
  }

  /**
   * Eliminar la relación manager-artista
   */
  async removeRelation(artistId: number, currentUserId: number): Promise<void> {
    const artist = await this.usersRepository.findOne({
      where: { user_id: artistId },
    });

    if (!artist) {
      throw new NotFoundException('Artista no encontrado.');
    }

    if (!artist.managerId) {
      throw new BadRequestException('Este artista no tiene manager.');
    }

    // Validar que el usuario actual es el manager o el artista
    const isManager = artist.managerId === currentUserId;
    const isArtist = artist.user_id === currentUserId;

    if (!isManager && !isArtist) {
      throw new ForbiddenException('No tienes permiso para eliminar esta relación.');
    }

    const currentManagerId = artist.managerId;

    // Eliminar la relación
    await this.usersRepository.update(
      { user_id: artistId },
      { managerId: () => 'NULL' }
    );

    if (currentManagerId) {
      this.managerRequestsGateway.emitRelationRemoved({
        artistId,
        managerId: currentManagerId,
        performedBy: currentUserId,
      });
    }
  }
}
