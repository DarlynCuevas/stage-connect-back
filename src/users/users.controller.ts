import { Controller, Get, Patch, Body, UseGuards, Request, Delete, Param, ForbiddenException, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
// ...existing code...

@Controller('users')
// Se aplican los guards: 1. Autenticación (JWT), 2. Autorización (Roles)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint público para búsqueda de managers desde perfil promotor
  @Get('managers-search')
  async searchManagers(
    @Query('query') query?: string,
    @Query('city') city?: string,
    @Query('featured') featured?: string,
    @Query('verified') verified?: string,
    @Query('favorite') favorite?: string,
  ) {
    // Construir objeto de filtros
    const filters: any = {};
    if (query) filters.query = query;
    if (city) filters.city = city;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (verified !== undefined) filters.verified = verified === 'true';
    if (favorite !== undefined) filters.favorite = favorite === 'true';

    // Buscar managers con filtros
    let managers = await this.usersService.findByRoleWithFilters('Manager', filters);
    return managers;
  }
// ...existing code...

  @Get('me') // GET /api/users/me (Todos los roles autenticados pueden acceder)
  async getProfile(@Request() req) {
    const userId = req.user.user_id;
    const fullUser = await this.usersService.findById(userId);
    if (!fullUser) {
      throw new ForbiddenException('Usuario no encontrado');
    }
    return fullUser;
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