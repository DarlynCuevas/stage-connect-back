import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('public/promoters')
export class PublicPromotersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('discover')
  async discoverPromoters(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
    @Query('verified') verified?: string,
    @Query('featured') featured?: string,
    @Query('date') date?: string,
  ) {
    const filters: any = {};
    if (city) filters.city = city;
    if (country) filters.country = country;
    if (query) filters.query = query;
    if (verified !== undefined) filters.verified = verified === 'true';
    if (featured !== undefined) filters.featured = featured === 'true';
    if (date) filters.date = date;
    if (page) filters.page = page;
    if (pageSize) filters.pageSize = pageSize;

    // Lógica idéntica: role Promotor
    const result = await this.usersService.findByRoleWithFilters('Promotor', filters);
    return result;
  }
}
