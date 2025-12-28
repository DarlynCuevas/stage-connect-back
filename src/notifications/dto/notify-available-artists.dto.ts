export class NotifyAvailableArtistsDto {
  venueId: string;
  filters: {
    genre?: string[];
    country?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    date?: string;
    // otros filtros si los necesitas
  };
  price: number;
}
