import { IsInt, IsString, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  artistId: number;

  @IsInt()
  reviewerId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsOptional()
  @IsString()
  type?: string; // Por si en el futuro se reseñan otros tipos
}
