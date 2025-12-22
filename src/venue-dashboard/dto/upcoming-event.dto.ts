export class UpcomingEventDto {
  id: string;
  date: string;
  artist: string;
  amount: number;
  paymentStatus: 'Pagado' | 'Pendiente';
  eventName?: string;
}
