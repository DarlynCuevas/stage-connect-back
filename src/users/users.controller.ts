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

  // Endpoint público para búsqueda de locales desde perfil artista
  @Get('venues-search')
  async searchVenues(
    @Query('query') query?: string,
    @Query('city') city?: string,
    @Query('type') type?: string,
    @Query('date') date?: string,
    @Query('featured') featured?: string,
    @Query('verified') verified?: string,
    @Query('favorite') favorite?: string,
  ) {
    // Construir objeto de filtros
    const filters: any = {};
    if (query) filters.query = query;
    if (city) filters.city = city;
    if (type) filters.type = type;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (verified !== undefined) filters.verified = verified === 'true';
    if (favorite !== undefined) filters.favorite = favorite === 'true';

    // Buscar venues (rol Local) con filtros
    let venues = await this.usersService.findByRoleWithFilters('Local', filters);

    // Si hay filtro de fecha, filtrar por blockedDays en el resultado final
    if (date) {
      venues = venues.filter((venue: any) => {
        if (!venue.blockedDays) return true;
        return !venue.blockedDays.includes(date);
      });
    }
    return venues;
  }
// ...existing code...

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