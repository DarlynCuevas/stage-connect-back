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
}