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
    const data = body.venueId || body;
    console.log('notifyAvailableDate body recibido:', data);
    return this.notificationsService.notifyAvailableArtists(data.venueId, data.filters, data.price);
  }
}
