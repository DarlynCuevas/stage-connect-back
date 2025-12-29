import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotifyAvailableArtistsDto } from './notifications/dto/notify-available-artists.dto';



@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**   
   * Notifica a artistas y managers que un local tiene un día disponible
   * Body: { venueId: string, date: string (YYYY-MM-DD) }
   */
  @Post('available-date')
  async notifyAvailableDate(@Body() body: any) {
    console.log('notifyAvailableDate body recibido:', body);
    return this.notificationsService.notifyAvailableArtists(body.venueId, body.filters, body.price);
  }
}
