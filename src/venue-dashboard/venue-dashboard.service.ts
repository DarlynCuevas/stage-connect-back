import { Injectable } from '@nestjs/common';
import { VenueAlertDto } from './dto/venue-alert.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Request, RequestStatus } from '../requests/request.entity';
import { User } from '../users/user.entity';

@Injectable()
export class VenueDashboardService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getSummary(venueId: number) {
    // Fechas para el mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Total gastado este mes (Accepted, requester = venueId, eventDate en mes actual)
    const acceptedRequests = await this.requestRepository.find({
      where: {
        requester: { user_id: venueId },
        status: RequestStatus.ACEPTADA,
        eventDate: Between(firstDay, lastDay),
      },
      relations: ['artist'],
    });
    const totalSpentThisMonth = acceptedRequests.reduce((sum, req) => sum + Number(req.offeredPrice), 0);

    // 2. Pagos pendientes (Pending, requester = venueId, eventDate >= hoy)
    const pendingPayments = await this.requestRepository.count({
      where: {
        requester: { user_id: venueId },
        status: RequestStatus.PENDIENTE,
        eventDate: MoreThanOrEqual(now),
      },
    });

    // 3. Artistas contratados este mes (Accepted, requester = venueId, eventDate en mes actual, artistas únicos)
    const artistsHiredThisMonth = new Set(acceptedRequests.map(req => req.artist?.user_id)).size;

    // 4. Próximos eventos (Accepted, requester = venueId, eventDate >= hoy)
    const upcomingEvents = await this.requestRepository.count({
      where: {
        requester: { user_id: venueId },
        status: RequestStatus.ACEPTADA,
        eventDate: MoreThanOrEqual(now),
      },
    });

    return {
      totalSpentThisMonth,
      pendingPayments,
      artistsHiredThisMonth,
      upcomingEvents,
    };
  }

  async getMonthlySpending(venueId: number) {
    // Buscar todas las requests aceptadas del local
    const acceptedRequests = await this.requestRepository.find({
      where: {
        requester: { user_id: venueId },
        status: RequestStatus.ACEPTADA,
      },
    });

    // Agrupar por mes y año (YYYY-MM)
    const monthlyTotals: Record<string, number> = {};
    for (const req of acceptedRequests) {
      const date = new Date(req.eventDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(req.offeredPrice);
    }

    // Formatear resultado
    return Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }));
  }

  async getUpcomingEvents(venueId: number) {
    const now = new Date();
    // Buscar requests del local con fecha futura
    const requests = await this.requestRepository.find({
      where: {
        requester: { user_id: venueId },
        eventDate: MoreThanOrEqual(now),
      },
      relations: ['artist'],
      order: { eventDate: 'ASC' },
    });

    // Mapear a DTO
    return requests.map(req => {
      const eventDate = req.eventDate instanceof Date ? req.eventDate : new Date(req.eventDate);
      return {
        id: req.id.toString(),
        date: eventDate.toISOString().split('T')[0],
        artist: req.artist?.name || '',
        amount: Number(req.offeredPrice),
        paymentStatus: req.status === RequestStatus.ACEPTADA ? 'Pagado' : 'Pendiente',
        eventName: req.eventType,
      };
    });
  }

  async getPaymentHistory(venueId: number) {
    // Buscar todas las requests del local (Accepted, Rejected, etc.)
    const requests = await this.requestRepository.find({
      where: {
        requester: { user_id: venueId },
      },
      relations: ['artist'],
      order: { eventDate: 'DESC' },
    });

    // Mapear a DTO
    return requests.map(req => {
      let status: 'Pagado' | 'Devuelto' | 'Cancelado' = 'Pagado';
      if (req.status === RequestStatus.RECHAZADA) status = 'Cancelado';
      // Si hay lógica de devolución, aquí se puede ajustar
      return {
        id: req.id.toString(),
        date: (req.eventDate instanceof Date ? req.eventDate : new Date(req.eventDate)).toISOString().split('T')[0],
        artist: req.artist?.name || '',
        event: req.eventType,
        amount: Number(req.offeredPrice),
        status,
      };
    });
  }

  async getAlerts(venueId: number) {
    const now = new Date();
    const alerts: VenueAlertDto[] = [];

    // 1. Pagos pendientes (requests pendientes con fecha futura)
    const pending = await this.requestRepository.find({
      where: {
        requester: { user_id: venueId },
        status: RequestStatus.PENDIENTE,
        eventDate: MoreThanOrEqual(now),
      },
    });
    for (const req of pending) {
      alerts.push({
        type: 'payment_due' as const,
        message: `Pago pendiente para el evento del ${new Date(req.eventDate).toLocaleDateString()} (${req.eventType})`,
        relatedId: req.id.toString(),
      });
    }

    // 2. Eventos aceptados pero no calificados (ejemplo: eventos pasados, Accepted)
    const acceptedPast = await this.requestRepository.find({
      where: {
        requester: { user_id: venueId },
        status: RequestStatus.ACEPTADA,
        eventDate: Between(new Date(now.getFullYear() - 1, 0, 1), now),
      },
      relations: ['artist'],
    });
    // Aquí podrías filtrar por los que no tienen review, si existe esa lógica
    for (const req of acceptedPast) {
      alerts.push({
        type: 'rate_artist' as const,
        message: `¿Ya calificaste a ${req.artist?.name || 'el artista'} del evento del ${new Date(req.eventDate).toLocaleDateString()}?`,
        relatedId: req.id.toString(),
      });
    }

    // 3. Eventos próximos aceptados pero aún no pagados (opcional, si hay lógica de pago)
    // Aquí podrías agregar lógica adicional según reglas de negocio

    return alerts;
  }
}
