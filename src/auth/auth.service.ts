// Archivo: src/auth/auth.service.ts

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // Importamos el servicio JWT
import { UsersService } from '../users/users.service'; 
import { RegisterDto } from './dto/register.dto';
import { CreateUserInterface } from '../users/dto/create-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService, // <-- Inyectamos el servicio JWT
  ) {} 

  async register(registerDto: RegisterDto): Promise<any> { 
    
    // 1. Verificación de email duplicado
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    // ... (rest of the logic using registerDto.email, registerDto.password, registerDto.role)
    
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.usersService.create({ 
      email: registerDto.email,
      passwordHash: passwordHash,
      role: registerDto.role,
      name: registerDto.name
    });
    // ...
    const { passwordHash: removedHash, ...result } = newUser;
    return result;
  }

  /**
   * Valida el usuario (usado internamente por el Login)
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // Comparamos la contraseña en texto plano con el hash de la BBDD
    const isMatch = await bcrypt.compare(pass, user.passwordHash);

    if (isMatch) {
      // Si la contraseña es correcta, retornamos el usuario (excluyendo el hash)
      const { passwordHash, ...result } = user;
      return result;
    }

    // Si no coincide
    return null;
  }

  /**
   * Proceso principal de Login (Crea el token JWT)
   */
  async login(user: any) {
    // Los datos que queremos guardar en el token (Payload)
    const payload = { 
      user_id: user.user_id, 
      email: user.email, 
      role: user.role 
    };

    return {
      // Genera el token que el Frontend usará para futuras peticiones
      access_token: this.jwtService.sign(payload),
      role: user.role,
    };
  }
}