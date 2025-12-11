// Archivo: src/users/users.controller.ts

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport'; 
import { Roles } from '../auth/decorators/roles.decorator'; 
import { RolesGuard } from '../auth/guards/roles.guard';    

@Controller('users')
// Se aplican los guards: 1. Autenticación (JWT), 2. Autorización (Roles)
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me') // GET /api/users/me (Todos los roles autenticados pueden acceder)
  getProfile(@Request() req) {
    return {
      message: 'Tu perfil:',
      user: req.user,
    };
  }
  
  // Endpoint: solo accesible para Managers
  @Roles('Manager') // <-- ÚNICO rol permitido
  @Get('manager-dashboard') // GET /api/users/manager-dashboard
  getManagerData(@Request() req) {
    return {
      message: `¡Bienvenido Manager ${req.user.email}! Acceso total a esta área.`,
      user: req.user,
    };
  }
}