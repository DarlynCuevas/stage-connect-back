import { Controller, Get } from '@nestjs/common';
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
  async getAllVenues() {
    const venues = await this.usersService.findByRoleWithFilters('Local', {});
    return venues.map((u) => this.mapUser(u)).filter(Boolean);
  }
}