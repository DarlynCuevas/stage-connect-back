import { Expose, Type } from 'class-transformer';
import { UserSafeDto } from '../../requests/dto/request-safe.dto';

export class VenueProfileSafeDto {
  @Expose()
  user_id: number;

  @Expose()
  name?: string;

  @Expose()
  avatar?: string;

  @Expose()
  city?: string;

  @Expose()
  country?: string;

  @Expose()
  nickName?: string;
}

export class ArtistProfileSafeDto {
  @Expose()
  user_id: number;

  @Expose()
  nickName?: string;

  @Expose()
  basePrice?: number;

  @Expose()
  @Type(() => UserSafeDto)
  user: UserSafeDto;
}

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
  @Type(() => ArtistProfileSafeDto)
  artist: ArtistProfileSafeDto;

  @Expose()
  @Type(() => UserSafeDto)
  manager: UserSafeDto;

  @Expose()
  @Type(() => VenueProfileSafeDto)
  venue: VenueProfileSafeDto;
}
