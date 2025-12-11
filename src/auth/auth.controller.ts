// Archivo: src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; // Importamos el DTO
import { RegisterDto } from './dto/register.dto';

@Controller('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  // Usamos el nuevo nombre del DTO
  async register(@Body() registerDto: RegisterDto) { 
    return this.authService.register(registerDto);
  }

  @Post('login') // La ruta completa es POST /api/auth/login
  async login(@Body() loginDto: LoginDto) {
    
    // 1. Validamos las credenciales (llama a validateUser en AuthService)
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);

    // 2. Si las credenciales son válidas, generamos el token JWT
    return this.authService.login(user);
  }
}