import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface ManagerRequestCreatedPayload {
  id: number;
  senderId: number;
  senderName?: string;
  senderRole?: string;
  receiverId: number;
  receiverRole?: string;
  message?: string;
  status: string;
  createdAt?: string;
}

interface ManagerRequestUpdatedPayload {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  updatedAt?: string;
}

interface ManagerRelationRemovedPayload {
  artistId: number;
  managerId: number;
  performedBy: number;
}

interface ManagerRequestDeletedPayload {
  id: number;
  senderId: number;
  receiverId: number;
}

@Injectable()
@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  },
})
export class ManagerRequestsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService, private configService: ConfigService) {}

  handleConnection(client: any) {
    const authHeader: string | undefined = client.handshake?.headers?.authorization;
    const tokenFromAuth = client.handshake?.auth?.token;
    const tokenFromQuery = client.handshake?.query?.token;

    const token = tokenFromAuth || tokenFromQuery || (authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined);

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.user_id;
      if (!userId) {
        client.disconnect();
        return;
      }

      client.data.user = {
        user_id: userId,
        email: payload.email,
        role: payload.role,
      };

      const room = this.getUserRoom(userId);
      client.join(room);
    } catch (err) {
      client.disconnect();
    }
  }

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }

  emitManagerRequestCreated(payload: ManagerRequestCreatedPayload) {
    const room = this.getUserRoom(payload.receiverId);
    this.server?.to(room).emit('manager-request.created', payload);
  }

  emitManagerRequestUpdated(payload: ManagerRequestUpdatedPayload) {
    const senderRoom = this.getUserRoom(payload.senderId);
    const receiverRoom = this.getUserRoom(payload.receiverId);
    this.server?.to(senderRoom).emit('manager-request.updated', payload);
    this.server?.to(receiverRoom).emit('manager-request.updated', payload);
  }

  emitManagerRequestDeleted(payload: ManagerRequestDeletedPayload) {
    const senderRoom = this.getUserRoom(payload.senderId);
    const receiverRoom = this.getUserRoom(payload.receiverId);
    this.server?.to(senderRoom).emit('manager-request.deleted', payload);
    this.server?.to(receiverRoom).emit('manager-request.deleted', payload);
  }

  emitRelationRemoved(payload: ManagerRelationRemovedPayload) {
    const artistRoom = this.getUserRoom(payload.artistId);
    const managerRoom = this.getUserRoom(payload.managerId);
    this.server?.to(artistRoom).emit('manager-relation.removed', payload);
    this.server?.to(managerRoom).emit('manager-relation.removed', payload);
  }

  private getUserRoom(userId: number): string {
    return `user:${userId}`;
  }
}
