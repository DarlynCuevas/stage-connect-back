import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('public/users')
export class PublicUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const user = await this.usersService.findById(numericId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  @Get()
  async findByRole(
    @Query('role') role?: string,
    @Query('query') query?: string,
    @Query('genre') genre?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
  ) {
    if (!role) {
      return [];
    }

    // parse numeric filters
    const filters: any = {};
    if (query) filters.query = query;
    if (genre) filters.genre = genre;
    if (country) filters.country = country;
    if (city) filters.city = city;
    if (priceMin) filters.priceMin = parseFloat(priceMin);
    if (priceMax) filters.priceMax = parseFloat(priceMax);

    const users = await this.usersService.findByRoleWithFilters(role, filters);
    return users;
  }
}
