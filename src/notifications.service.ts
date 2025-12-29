import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { NotificationsGateway } from './notifications.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interested } from './interested.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(Interested)
    private readonly interestedRepo: Repository<Interested>,
  ) {}

  /**
   * Notifica a artistas y managers que un local tiene un día disponible
   * venueId: id del local
   * date: fecha disponible (YYYY-MM-DD)
   */
  async notifyAvailableArtists(venueId: string, filters: any, price?: number) {
    // 1. Buscar artistas según los filtros recibidos
    const availableArtists = await this.usersService.findByRoleWithFilters('Artista', filters);
    let artistsArray: any[] = [];
    if (availableArtists && typeof availableArtists === 'object') {
      const { populares = [], destacados = [], resto = [] } = availableArtists;
      artistsArray = [...populares, ...destacados, ...resto];
    }
    // Filtrar por caché máximo <= precio ofrecido + 15%
    let maxPrice = price ? price * 1.15 : undefined;
    artistsArray = artistsArray.filter(a => {
      const cacheMax = typeof a.cacheMax === 'number' ? a.cacheMax : (a.priceMax ?? 0);
      return typeof a.user_id === 'number' && a.user_id > 0 && (!maxPrice || cacheMax <= maxPrice);
    });
    const artistIds = artistsArray.map(a => a.user_id);

    // Registrar oferta en la base de datos (tabla Interested)
    if (artistIds.length > 0) {
      const interestedList = artistIds.map((artistId: number) => this.interestedRepo.create({
        venueId: Number(venueId),
        managerId: null,
        artistId,
        date: filters.date || '',
        price: price ?? null,
        status: 'pending',
      }));
      await this.interestedRepo.save(interestedList);
    }

    // 2. Buscar managers con artistas disponibles según los filtros
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
      date: filters.date || '',
      price,
      artistIds,
      managerIds: managerIdsToSend,
    });

    return {
      notifiedArtists: artistIds,
      notifiedManagers: managerIdsToSend,
      filters,
      price,
      venueId
    };
  }

  // Stub: lógica real de socket se implementa después
  private async sendSocketNotification(payload: {
    venueId: string;
    venueName?: string;
    venueCity?: string;
    date: string;
    price?: number;
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
