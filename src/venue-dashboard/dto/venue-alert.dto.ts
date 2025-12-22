export class VenueAlertDto {
  type: 'payment_due' | 'event_unpaid' | 'rate_artist';
  message: string;
  relatedId?: string;
}
