import { Expose, Type } from 'class-transformer';
import { UserSafeDto } from '../../requests/dto/request-safe.dto';

export class InterestedSafeDto {
  @Expose()
  id: number;

  @Expose()
  date: string;

  @Expose()
  price: number | null;

  @Expose()
  status: string;

  @Expose()
  createdAt: string;

  @Expose()
  artistId: number;

  @Expose()
  @Type(() => UserSafeDto)
  artist: UserSafeDto;

  @Expose()
  @Type(() => UserSafeDto)
  manager: UserSafeDto;

  @Expose()
  @Type(() => UserSafeDto)
  venue: UserSafeDto;
}
