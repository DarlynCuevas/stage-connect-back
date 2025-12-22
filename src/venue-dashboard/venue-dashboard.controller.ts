import { Controller, Get, Param } from '@nestjs/common';
import { VenueDashboardService } from './venue-dashboard.service';

@Controller('venue-dashboard')
export class VenueDashboardController {
  constructor(private readonly dashboardService: VenueDashboardService) {}

  @Get(':venueId/summary')
  getSummary(@Param('venueId') venueId: string) {
    return this.dashboardService.getSummary(Number(venueId));
  }

  @Get(':venueId/monthly-spending')
  getMonthlySpending(@Param('venueId') venueId: string) {
    return this.dashboardService.getMonthlySpending(Number(venueId));
  }

  @Get(':venueId/upcoming-events')
  getUpcomingEvents(@Param('venueId') venueId: string) {
    return this.dashboardService.getUpcomingEvents(Number(venueId));
  }

  @Get(':venueId/payment-history')
  getPaymentHistory(@Param('venueId') venueId: string) {
    return this.dashboardService.getPaymentHistory(Number(venueId));
  }

  @Get(':venueId/alerts')
  getAlerts(@Param('venueId') venueId: string) {
    return this.dashboardService.getAlerts(Number(venueId));
  }
}
