// Archivo: src/users/users.controller.ts

import { Controller, Get, Patch, Body, UseGuards, Request, Delete, Param, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport'; 
import { Roles } from '../auth/decorators/roles.decorator'; 
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
// Se aplican los guards: 1. Autenticación (JWT), 2. Autorización (Roles)
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me') // GET /api/users/me (Todos los roles autenticados pueden acceder)
  async getProfile(@Request() req) {
    const userId = req.user.user_id;
    const fullUser = await this.usersService.findById(userId);
    
    if (!fullUser) {
      return {
        message: 'Tu perfil (datos básicos del JWT):',
        user: req.user,
      };
    }
    
    return {
      message: 'Tu perfil:',
      user: fullUser,
    };
  }

  @Patch('profile') // PATCH /api/users/profile
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.user_id;
    const updatedUser = await this.usersService.updateProfile(userId, updateProfileDto);
    return {
      message: 'Perfil actualizado correctamente',
      user: updatedUser,
    };
  }

  @Delete(':id') // DELETE /api/users/:id
  async deleteUser(@Request() req, @Param('id') id: string) {
    const targetId = parseInt(id, 10);
    const requesterId = req.user.user_id;

    // Only allow deleting own account unless roles policy changes
    if (requesterId !== targetId) {
      throw new ForbiddenException('No autorizado para eliminar esta cuenta');
    }

    await this.usersService.deleteUser(targetId);
    return { message: 'Cuenta eliminada correctamente' };
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