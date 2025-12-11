import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genre?: string[];

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'basePrice must be greater than or equal to 0' })
  basePrice?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsNumber()
  managerId?: number;

  @IsOptional()
  socialLinks?: { instagram?: string; youtube?: string; spotify?: string; tiktok?: string };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];
}
