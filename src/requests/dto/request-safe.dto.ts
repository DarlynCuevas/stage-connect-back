import { Expose, Type } from 'class-transformer';

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
}

export class RequestSafeDto {
  @Expose()
  id: number;

  @Expose()
  eventDate: Date;

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
  createdAt: Date;

  @Expose()
  @Type(() => UserSafeDto)
  artist: UserSafeDto;

  @Expose()
  @Type(() => UserSafeDto)
  requester: UserSafeDto;
}
