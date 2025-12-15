import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateUserFiscalDataDto {
  @IsNotEmpty()
  @IsNumber()
  user: number; // userId si la entidad espera userId, o user si espera relación

  @IsNotEmpty()
  @IsString()
  dniNif: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsNotEmpty()
  @IsString()
  direccion: string;

  @IsNotEmpty()
  @IsString()
  ciudad: string;

  @IsNotEmpty()
  @IsString()
  provincia: string;

  @IsNotEmpty()
  @IsString()
  codigoPostal: string;

  @IsNotEmpty()
  @IsString()
  pais: string;
}

export class UpdateUserFiscalDataDto {
  @IsOptional()
  @IsString()
  dniNif?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  pais?: string;
}
