import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('public/venues')
export class PublicVenuesController {
  constructor(private readonly usersService: UsersService) {}

  @Get('discover')
  async discoverVenues(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
    @Query('verified') verified?: string,
    @Query('featured') featured?: string,
    @Query('date') date?: string,
  ) {
    // Construir filtros igual que en managers
    const filters: any = {};
    if (city) filters.city = city;
    if (country) filters.country = country;
    if (query) filters.query = query;
    if (verified !== undefined) filters.verified = verified === 'true';
    if (featured !== undefined) filters.featured = featured === 'true';
    if (date) filters.date = date;
    if (page) filters.page = page;
    if (pageSize) filters.pageSize = pageSize;

    // Lógica idéntica: role Local
    const result = await this.usersService.findByRoleWithFilters('Local', filters);
    // Sanitizar todos los usuarios en todos los bloques
    const sanitize = (arr: any[]) => arr.map(u => {
      const { password, passwordHash, password_hash, email, ...rest } = u;
      return rest;
    });
    if (result && typeof result === 'object') {
      for (const key of Object.keys(result)) {
        if (Array.isArray(result[key])) {
          result[key] = sanitize(result[key]);
        }
      }
    }
    return result;
  }
}
