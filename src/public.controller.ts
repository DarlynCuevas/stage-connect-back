


 
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users/users.service';

@Controller('public')
export class PublicController {

  @UseGuards(AuthGuard('jwt'))
  @Get('artists/discover')
  async discoverArtists(@Request() req) {
    // Sin filtros: descubrimiento puro
    const artists = await this.usersService.findByRoleWithFilters('Artista', {});
    let userCity: string | undefined = undefined;
    // Si hay usuario autenticado (token válido), usar su ciudad
    if (req.user && req.user.user_id) {
      const user = await this.usersService.findById(req.user.user_id);
      userCity = user?.city;
    }
    // Filtrar enCiudad solo si hay ciudad de usuario
    let enCiudadArr: any[] = [];
    if (userCity) {
      enCiudadArr = [...(artists.populares || []), ...(artists.destacados || []), ...(artists.recienLlegados || []), ...(artists.masContratados || []), ...(artists.resto || [])]
        .filter((u) => typeof u.city === 'string' && typeof userCity === 'string' && u.city.toLowerCase() === userCity.toLowerCase())
        .map((u) => this.mapUser(u)).filter(Boolean);
    }
    return {
      populares: Array.isArray(artists.populares) ? artists.populares.map((u) => this.mapUser(u)).filter(Boolean) : [],
      destacados: Array.isArray(artists.destacados) ? artists.destacados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      recienLlegados: Array.isArray(artists.recienLlegados) ? artists.recienLlegados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      enCiudad: enCiudadArr,
      masContratados: Array.isArray(artists.masContratados) ? artists.masContratados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      resto: Array.isArray(artists.resto) ? artists.resto.map((u) => this.mapUser(u)).filter(Boolean) : [],
      pagination: artists.pagination || {},
    };
  }
  constructor(private readonly usersService: UsersService) {}

  @Get('managers/discover')
  async discoverManagers() {
    // Sin filtros: descubrimiento puro
    const managers = await this.usersService.findByRoleWithFilters('Manager', {});
    return {
      populares: Array.isArray(managers.populares) ? managers.populares.map((u) => this.mapUser(u)).filter(Boolean) : [],
      destacados: Array.isArray(managers.destacados) ? managers.destacados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      verificados: Array.isArray(managers.verificados) ? managers.verificados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      masContratados: Array.isArray(managers.masContratados) ? managers.masContratados.map((u) => this.mapUser(u)).filter(Boolean) : [],
      resto: Array.isArray(managers.resto) ? managers.resto.map((u) => this.mapUser(u)).filter(Boolean) : [],
      pagination: managers.pagination || {},
    };
  }

  private mapUser(user: any) {
    if (!user) return null;
    const { user_id, email, passwordHash, password_hash, ...rest } = user;
    // No exponer email ni passwordHash ni password_hash
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
    // Si hay algún filtro activo, devolver solo el array plano paginado
    const hasFilters = !!(filters.query || (filters.genre && filters.genre.length) || filters.country || filters.city || filters.priceMin || filters.priceMax || filters.date);
    if (hasFilters) {
      // Si la respuesta es agrupada, tomar solo el array paginado (resto) y la paginación
      if (artists && typeof artists === 'object' && Array.isArray(artists.resto)) {
        return {
          results: artists.resto.map((u) => this.mapUser(u)).filter(Boolean),
          pagination: artists.pagination || {},
        };
      } else if (Array.isArray(artists)) {
        // Si la respuesta ya es plana
        return {
          results: artists.map((u) => this.mapUser(u)).filter(Boolean),
          pagination: {},
        };
      }
    }
    // Sin filtros: devolver agrupado
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
    // Nuevo: managers verificados (todos los verificados, sin paginación ni filtros)
    const allVerificados = await this.usersService.findByRoleWithFilters('Manager', { verified: true, page: 1, pageSize: 1000 });
    const verificados = Array.isArray(allVerificados.populares)
      ? [...allVerificados.populares, ...(allVerificados.destacados || []), ...(allVerificados.resto || [])]
      : [];
    return {
      populares: Array.isArray(managers.populares) ? managers.populares.map((u) => ({
        ...this.mapUser(u),
        favorite: favoriteIds.has(u.user_id),
      })).filter(Boolean) : [],
      destacados: Array.isArray(managers.destacados) ? managers.destacados.map((u) => ({
        ...this.mapUser(u),
        favorite: favoriteIds.has(u.user_id),
      })).filter(Boolean) : [],
      verificados: verificados.map((u) => ({
        ...this.mapUser(u),
        favorite: favoriteIds.has(u.user_id),
      })),
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