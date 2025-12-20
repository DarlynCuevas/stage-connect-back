import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';


@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**   
   * Notifica a artistas y managers que un local tiene un día disponible
   * Body: { venueId: string, date: string (YYYY-MM-DD) }
   */
  @Post('available-date')
  async notifyAvailableDate(@Body() body: { venueId: string; date: string; price?: number }) {
    console.log('notifyAvailableDate body recibido:', body);
    return this.notificationsService.notifyAvailableDate(body.venueId, body.date, body.price);
  }
}
