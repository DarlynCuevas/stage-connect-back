import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

type RequestCreatedPayload = {
  id: number;
  artistId: number;
  requesterId: number;
  eventDate: string;
  eventLocation: string;
  eventType: string;
  offeredPrice: number;
  message?: string;
  status: string;
  createdAt?: string;
};

/**
 * Gateway for realtime booking request events.
 */
@Injectable()
@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  },
})
export class RequestsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService, private configService: ConfigService) {}

  /**
   * Validate JWT and add each connected user to a personal room so we can target events by user_id.
   */
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

      // Attach user to client data
      client.data.user = {
        user_id: userId,
        email: payload.email,
        role: payload.role,
      };

      // Join the user to their personal room
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

  /** Notify a specific artist that a new request was created. */
  emitRequestCreated(payload: RequestCreatedPayload) {
    const room = this.getUserRoom(payload.artistId);
    this.server?.to(room).emit('request.created', payload);
  }

  private getUserRoom(userId: number): string {
    return `user:${userId}`;
  }
}