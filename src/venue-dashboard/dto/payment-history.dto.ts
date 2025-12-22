export class PaymentHistoryDto {
  id: string;
  date: string;
  artist: string;
  event: string;
  amount: number;
  status: 'Pagado' | 'Devuelto' | 'Cancelado';
}
