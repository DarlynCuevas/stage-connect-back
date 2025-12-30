import { Expose, Type } from 'class-transformer';
import { UserSafeDto } from './request-safe.dto';

export class OfferSafeDto {
  @Expose()
  id: number;

  @Expose()
  amount: number;

  @Expose()
  type: string;

  @Expose()
  message?: string;

  @Expose()
  accepted: boolean;

  @Expose()
  rejected: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UserSafeDto)
  user: UserSafeDto;
}