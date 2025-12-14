import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Controller('public')
export class PublicController {
  constructor(private readonly usersService: UsersService) {}

  private mapUser(user: any) {
    if (!user) return null;
    const { user_id, ...rest } = user;
    return { id: user_id, ...rest };
  }

  @Get('venues')
  async getAllVenues(
    @Query('featured') featured?: string,
    @Query('verified') verified?: string,
    @Query('favorite') favorite?: string,
    @Query('city') city?: string,
    @Query('type') type?: string,
    @Query('query') query?: string,
  ) {
    // Convert query params to booleans if present
    const filters: any = {};
    if (featured !== undefined) filters.featured = featured === 'true';
    if (verified !== undefined) filters.verified = verified === 'true';
    if (favorite !== undefined) filters.favorite = favorite === 'true';
    if (city) filters.city = city;
    if (query) filters.query = query;
    // type is not handled here, but could be added if needed
    const venues = await this.usersService.findByRoleWithFilters('Local', filters);
    return venues.map((u) => this.mapUser(u)).filter(Boolean);
  }
  @Get('users')
  async getAllUsers(
    @Query('role') role?: string,
    @Query('genre') genre?: string[] | string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('query') query?: string,
  ) {
    // Solo soportamos role=Artista por ahora
    if (role !== 'Artista') return [];
    // Normalizar géneros
    let genreArr: string[] = [];
    if (Array.isArray(genre)) genreArr = genre;
    else if (typeof genre === 'string' && genre.length > 0) genreArr = [genre];
    // Filtros
    const filters: any = {
      genre: genreArr,
      country,
      city,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      query,
    };
    const artists = await this.usersService.findByRoleWithFilters('Artista', filters);
    return artists.map((u) => this.mapUser(u)).filter(Boolean);
  }
}