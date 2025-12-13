// Archivo: src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'; 
import { ArtistProfile } from './artist-profile.entity';
import { ManagerProfile } from './manager-profile.entity';
import { VenueProfile } from './venue-profile.entity';
import { PromoterProfile } from './promoter-profile.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PublicUsersController } from './public-users.controller';
import { Request } from '../requests/request.entity';
import { BlockedDay } from '../blocked-days/blocked-day.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      ArtistProfile,
      ManagerProfile,
      VenueProfile,
      PromoterProfile,
      Request, 
      BlockedDay
    ]), 
  ],
  providers: [UsersService],
  controllers: [UsersController, PublicUsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}