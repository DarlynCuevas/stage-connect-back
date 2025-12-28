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
import { PublicVenuesController } from './public-venues.controller';
import { PublicPromotersController } from './public-promoters.controller';
import { Follower } from './follower.entity';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { Request } from '../requests/request.entity';
import { BlockedDay } from '../blocked-days/blocked-day.entity';
import { UserFiscalData } from './user-fiscal-data.entity';
import { UserFiscalDataService } from './user-fiscal-data.service';
import { UserFiscalDataController } from './user-fiscal-data.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      ArtistProfile,
      ManagerProfile,
      VenueProfile,
      PromoterProfile,
      Request, 
      BlockedDay,
      UserFiscalData,
      Follower
    ]), 
  ],
  providers: [UsersService, UserFiscalDataService, FollowersService],
  controllers: [UsersController, PublicUsersController, PublicVenuesController, PublicPromotersController, UserFiscalDataController, FollowersController],
  exports: [UsersService, UserFiscalDataService, TypeOrmModule, FollowersService],
})
export class UsersModule {}