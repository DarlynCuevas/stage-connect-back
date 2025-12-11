import { IsNotEmpty, IsEmail, IsString, MinLength, IsIn, isString } from 'class-validator';
import type { UserRole } from '../../users/user.entity';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNotEmpty()
  @IsString()
  // Asumo que UserRole incluye los 4 roles (Artista, Local, Manager, Promotor)
  @IsIn(['Artista', 'Local', 'Manager', 'Promotor'])
  role: UserRole;
}