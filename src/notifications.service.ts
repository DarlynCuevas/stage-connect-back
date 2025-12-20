import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Notifica a artistas y managers que un local tiene un día disponible
   * venueId: id del local
   * date: fecha disponible (YYYY-MM-DD)
   */
  async notifyAvailableDate(venueId: string, date: string) {
    // 1. Buscar artistas disponibles ese día
    const availableArtists = await this.usersService.findByRoleWithFilters('Artista', { date });
    // Unir todos los bloques de discoveryBlocks en un solo array
    let artistsArray: any[] = [];
    if (availableArtists && typeof availableArtists === 'object') {
      const { populares = [], destacados = [], resto = [] } = availableArtists;
      artistsArray = [...populares, ...destacados, ...resto];
    }
    // Solo los que tengan user_id válido (número mayor a 0)
    artistsArray = artistsArray.filter(a => typeof a.user_id === 'number' && a.user_id > 0);
    const artistIds = artistsArray.map(a => a.user_id);

    // 2. Buscar managers con artistas disponibles ese día
    const managerIds = Array.from(new Set(
      artistsArray.map((a: any) => a.managerId).filter((id: number | null) => !!id)
    ));
    const managers = await Promise.all(
      managerIds.map((id: number) => this.usersService.findById(id))
    );
    const availableManagers = managers.filter(Boolean);
    const managerIdsToSend = availableManagers.map((m: any) => m.user_id).filter(Boolean);

    // 3. Buscar datos del local
    let venueName = '';
    let venueCity = '';
    try {
      const venueUser = await this.usersService.findById(Number(venueId));
      if (venueUser) {
        venueName = venueUser.name || '';
        venueCity = venueUser.city || '';
      }
    } catch (e) {
      // Si falla, deja los campos vacíos
    }

    // 4. Enviar notificación por socket
    await this.sendSocketNotification({
      venueId,
      venueName,
      venueCity,
      date,
      artistIds,
      managerIds: managerIdsToSend,
    });

    // 4. Enviar notificación por email
    await this.sendEmailNotification({
      venueId,
      date,
      artistEmails: artistsArray.map((a: any) => a.email),
      managerEmails: availableManagers.map((m: any) => m.email),
    });

    return {
      message: `Notificación enviada para venue ${venueId} y fecha ${date}`,
      artistsNotified: artistsArray.map((a: any) => a.user_id),
      managersNotified: availableManagers.map((m: any) => m.user_id),
    };
  }

  // Stub: lógica real de socket se implementa después
  private async sendSocketNotification(payload: {
    venueId: string;
    venueName?: string;
    venueCity?: string;
    date: string;
    artistIds: number[];
    managerIds: number[];
  }) {
    this.notificationsGateway.emitAvailableDateNotification(payload);
    return;
  }

  // Stub: lógica real de email se implementa después
  private async sendEmailNotification(payload: {
    venueId: string;
    date: string;
    artistEmails: string[];
    managerEmails: string[];
  }) {
    // Aquí se integrará el servicio de email
    // Ejemplo: this.mailerService.sendAvailableDate(payload)
    return;
  }
}
