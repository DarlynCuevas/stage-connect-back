import { UseGuards } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

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
@UseGuards(WsJwtGuard)
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

  /**
   * Add each connected user to a personal room so we can target events by user_id.
   */
  handleConnection(client: any) {
    const userId = client?.data?.user?.user_id;
    if (userId) {
      client.join(this.getUserRoom(userId));
    }
  }

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }

  /** Notify a specific artist that a new request was created. */
  emitRequestCreated(payload: RequestCreatedPayload) {
    this.server?.to(this.getUserRoom(payload.artistId)).emit('request.created', payload);
  }

  private getUserRoom(userId: number): string {
    return `user:${userId}`;
  }
}