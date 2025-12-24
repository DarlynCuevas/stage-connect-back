import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './request.entity';
import { User } from '../users/user.entity';
import { ArtistProfile } from '../users/artist-profile.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RequestsGateway } from './requests.gateway';
import { AuthModule } from '../auth/auth.module';
import { BlockedDay } from '../blocked-days/blocked-day.entity';
import { BlockedDaysModule } from '../blocked-days/blocked-days.module';
import { ContractModule } from '../contracts/contract.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User, ArtistProfile, BlockedDay]),
    AuthModule,
    BlockedDaysModule,
    ContractModule,
  ],
  providers: [RequestsService, RequestsGateway],
  controllers: [RequestsController],
  exports: [RequestsService],
})
export class RequestsModule {}

