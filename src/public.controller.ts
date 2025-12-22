
 
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users/users.service';

@Controller('public')
export class PublicController {
  constructor(private readonly usersService: UsersService) {}

  private mapUser(user: any) {
    if (!user) return null;
    const { user_id, ...rest } = user;
    return { id: user_id, ...rest };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('venues')
  async getAllVenues(
    @Request() req,
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
    // Obtener favoritos del usuario autenticado
    const userId = req.user?.user_id;
    let favoriteIds = new Set();
    if (userId) {
      const favorites = await this.usersService.getFavorites(userId);
      favoriteIds = new Set(favorites.map(fav => fav.user_id));
    }
    return venues.map((u) => ({
      ...this.mapUser(u),
      favorite: favoriteIds.has(u.user_id),
    })).filter(Boolean);
  }
  @Get('artists')
  async getAllArtists(
    @Query('genre') genre?: string[] | string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('query') query?: string,
    @Query('date') date?: string,
  ) {
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
      date,
    };
    const artists = await this.usersService.findByRoleWithFilters('Artista', filters);
    // Mapear cada array del objeto, incluyendo recienLlegados
    return {
      populares: Array.isArray(artists.populares) ? artists.populares.map((u) => this.mapUser(u)).filter(Boolean) : [],
      destacados: Array.isArray(artists.destacados) ? artists.destacados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      recienLlegados: Array.isArray(artists.recienLlegados) ? artists.recienLlegados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      enCiudad: Array.isArray(artists.enCiudad) ? artists.enCiudad.map((u) => this.mapUser(u)).filter(Boolean) : [],
      masContratados: Array.isArray(artists.masContratados) ? artists.masContratados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      resto: Array.isArray(artists.resto) ? artists.resto.map((u) => this.mapUser(u)).filter(Boolean) : [],
      pagination: artists.pagination || {},
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('managers')
  async getAllManagers(
    @Request() req,
    @Query('city') city?: string,
    @Query('featured') featured?: string,
    @Query('verified') verified?: string,
    @Query('favorite') favorite?: string,
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const filters: any = {};
    if (city) filters.city = city;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (verified !== undefined) filters.verified = verified === 'true';
    if (favorite !== undefined) filters.favorite = favorite === 'true';
    if (query) filters.query = query;
    if (page !== undefined) filters.page = Number(page);
    if (pageSize !== undefined) filters.pageSize = Number(pageSize);
    const managers = await this.usersService.findByRoleWithFilters('Manager', filters);
    // Obtener favoritos del usuario autenticado
    const userId = req.user?.user_id;
    let favoriteIds = new Set();
    if (userId) {
      const favorites = await this.usersService.getFavorites(userId);
      favoriteIds = new Set(favorites.map(fav => fav.user_id));
    }
    // Estructura igual que artistas
    return {
      populares: Array.isArray(managers.populares) ? managers.populares.map((u) => ({
        ...this.mapUser(u),
        favorite: favoriteIds.has(u.user_id),
      })).filter(Boolean) : [],
      destacados: Array.isArray(managers.destacados) ? managers.destacados.map((u) => ({
        ...this.mapUser(u),
        favorite: favoriteIds.has(u.user_id),
      })).filter(Boolean) : [],
      resto: Array.isArray(managers.resto) ? managers.resto.map((u) => ({
        ...this.mapUser(u),
        favorite: favoriteIds.has(u.user_id),
      })).filter(Boolean) : [],
      pagination: managers.pagination || {},
    };
  }

    @Get('promoters')
  async getAllPromoters(
    @Query('city') city?: string,
    @Query('featured') featured?: string,
    @Query('verified') verified?: string,
    @Query('favorite') favorite?: string,
    @Query('query') query?: string,
  ) {
    const filters: any = {};
    if (city) filters.city = city;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (verified !== undefined) filters.verified = verified === 'true';
    if (favorite !== undefined) filters.favorite = favorite === 'true';
    if (query) filters.query = query;
    const promoters = await this.usersService.findByRoleWithFilters('Promotor', filters);
    return promoters.map((u) => this.mapUser(u)).filter(Boolean);
  }
}