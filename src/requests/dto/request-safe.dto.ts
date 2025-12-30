import { Expose, Type } from 'class-transformer';
import { OfferSafeDto } from './offer-safe.dto';

export class UserSafeDto {
  @Expose()
  user_id: number;

  @Expose()
  name: string;

  @Expose()
  avatar?: string;

  @Expose()
  banner?: string;

  @Expose()
  city?: string;

  @Expose()
  country?: string;

  @Expose()
  role: string;

  // Exponer basePrice si existe artistProfile
  @Expose({ name: 'basePrice' })
  get basePrice(): number | undefined {
    // @ts-ignore
    return this['artistProfile']?.basePrice;
  }
}

export class RequestSafeDto {
  @Expose()
  id: number;


  @Expose()
  eventDate: Date;

  @Expose()
  horaInicio?: string;

  @Expose()
  horaFin?: string;

  @Expose()
  eventLocation?: string;

  @Expose()
  eventType?: string;

  @Expose()
  offeredPrice?: number;

  @Expose()
  message?: string;

  @Expose()
  nombreLocal?: string;

  @Expose()
  ciudadLocal?: string;

  @Expose()
  status: string;

  @Expose()
  
  @Expose()
  @Type(() => OfferSafeDto)
  offers?: OfferSafeDto[];
  createdAt: Date;

  @Expose()
  @Type(() => UserSafeDto)
  artist: UserSafeDto;

  @Expose()
  @Type(() => UserSafeDto)
  requester: UserSafeDto;
}
