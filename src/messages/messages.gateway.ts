import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (token && jwtSecret) {
      try {
        const payload: any = jwt.verify(token, jwtSecret);
        if (payload && payload.user_id) {
          client.join(`user_${payload.user_id}`);
        }
      } catch (e) {
        client.disconnect();
      }
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Cleanup opcional
  }

  emitNewMessage(conversationId: number, message: any) {
    this.server.to(`user_${message.receiverId}`).emit('message.new', { conversationId, message });
  }
}
