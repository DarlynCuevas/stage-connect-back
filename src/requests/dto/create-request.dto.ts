import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestDto {
  @IsNotEmpty({ message: 'El ID del artista es requerido' })
  @IsNumber()
  artistId: number;

  @IsNotEmpty({ message: 'El ID del solicitante es requerido' })
  @IsNumber()
  requesterId: number;

  @IsNotEmpty({ message: 'La fecha del evento es requerida' })
  @Type(() => Date)
  @IsDate()
  eventDate: Date;

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
