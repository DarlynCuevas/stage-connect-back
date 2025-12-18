import { Controller, Get, Param, Query, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('public/users')
export class PublicUsersController {
  constructor(private readonly usersService: UsersService) {}

  private mapUser(user: any) {
    if (!user) return null;
    const { user_id, ...rest } = user;
    return { id: user_id, ...rest };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const user = await this.usersService.findById(numericId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.mapUser(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findByRole(
    @Request() req,
    @Query('role') role?: string,
    @Query('query') query?: string,
    @Query('genre') genre?: string | string[],
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('featured') featured?: string,
    @Query('verified') verified?: string,
  ) {
    if (!role) {
      return [];
    }

    // parse numeric filters
    const filters: any = {};
    if (query) filters.query = query;
    if (genre) {
      // genre can be a single string or array of strings
      filters.genre = Array.isArray(genre) ? genre : [genre];
    }
    if (country) filters.country = country;
    if (city) filters.city = city;
    if (priceMin) filters.priceMin = parseFloat(priceMin);
    if (priceMax) filters.priceMax = parseFloat(priceMax);

    if (featured !== undefined) filters.featured = featured === 'true';
    if (verified !== undefined) filters.verified = verified === 'true';
    const users = await this.usersService.findByRoleWithFilters(role, filters);

    // Obtener favoritos del usuario autenticado
    const userId = req.user?.user_id;
    let favoriteIds = new Set();
    if (userId) {
      const favorites = await this.usersService.getFavorites(userId);
      favoriteIds = new Set(favorites.map(fav => fav.user_id));
    }

    return users.map((u) => ({
      ...this.mapUser(u),
      favorite: favoriteIds.has(u.user_id),
    })).filter(Boolean);
  }

}
