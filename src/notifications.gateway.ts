import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  /**
   * Emitir notificación de fecha disponible a artistas y managers
   */
  emitAvailableDateNotification(payload: {
    venueId: string;
    venueName?: string;
    venueCity?: string;
    date: string;
    price?: number;
    artistIds: number[];
    managerIds: number[];
  }) {
    const { venueId, venueName, venueCity, date, price, artistIds, managerIds } = payload;
    const notification = { venueId, venueName, venueCity, date, price, type: 'available-date' };
    artistIds.forEach((id) => {
      this.server.to(`user:${id}`).emit('notification.available-date', notification);
    });
    managerIds.forEach((id) => {
      this.server.to(`user:${id}`).emit('notification.available-date', notification);
    });
  }
}
