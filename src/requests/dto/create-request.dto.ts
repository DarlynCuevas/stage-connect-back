import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty({ message: 'El ID del artista es requerido' })
  @IsNumber()
  artistId: number;

  @IsOptional()
  @IsNumber()
  requesterId?: number;

  @IsNotEmpty({ message: 'La fecha del evento es requerida' })
  @IsDateString()
  eventDate: string;

  @IsNotEmpty({ message: 'La ubicación del evento es requerida' })
  @IsString()
  eventLocation: string;

  @IsNotEmpty({ message: 'El tipo de evento es requerido' })
  @IsString()
  eventType: string;

  @IsNotEmpty({ message: 'El precio ofrecido es requerido' })
  @IsNumber()
  offeredPrice: number;

  @IsOptional()
  @IsString()
  message?: string;
}
