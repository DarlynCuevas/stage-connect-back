import { Controller, Get, Patch, Body, UseGuards, Request, Delete, Param, ForbiddenException, Query } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VenueProfile } from './venue-profile.entity';

@Controller('users')
// Se aplican los guards: 1. Autenticación (JWT), 2. Autorización (Roles)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Añadir un usuario a favoritos

  @Post('favorites/:favoriteUserId')
  async addFavorite(
    @Request() req,
    @Param('favoriteUserId') favoriteUserId: number
  ) {
    const userId = req.user.user_id;
    return this.usersService.addFavorite(userId, favoriteUserId);
  }

  // Eliminar un usuario de favoritos

  @Delete('favorites/:favoriteUserId')
  async removeFavorite(
    @Request() req,
    @Param('favoriteUserId') favoriteUserId: number
  ) {
    const userId = req.user.user_id;
    return this.usersService.removeFavorite(userId, favoriteUserId);
  }

  // Listar favoritos de un usuario

  @Get('favorites')
  async getFavorites(@Request() req) {
    const userId = req.user.user_id;
    return this.usersService.getFavorites(userId);
  }

  // Listar quién ha marcado a un usuario como favorito

  @Get('favorited-by')
  async getFavoritedBy(@Request() req) {
    const userId = req.user.user_id;
    return this.usersService.getFavoritedBy(userId);
  }

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

  @Get('me') // GET /api/users/me (Todos los roles autenticados pueden acceder)
  async getProfile(@Request() req) {
    const userId = req.user.user_id;
    const fullUser = await this.usersService.findById(userId);
    if (!fullUser) {
      throw new ForbiddenException('Usuario no encontrado');
    }
    // Si el usuario es Local, incluir venueProfile
    let venueProfile: VenueProfile | null = null;
    if (fullUser.role === 'Local' && fullUser.venueProfile) {
      venueProfile = fullUser.venueProfile;
    }
    return {
      ...fullUser,
      venueProfile,
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
    @Patch('me')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.user_id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Roles('Manager')
  @Get('managed-artists')
  async getManagedArtists(@Request() req) {
    const managerId = req.user.user_id;
    return this.usersService.findArtistsByManager(managerId);
  }
}