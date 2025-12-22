import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from '../requests/request.entity';
import { User } from '../users/user.entity';
import { VenueDashboardController } from './venue-dashboard.controller';
import { VenueDashboardService } from './venue-dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Request, User])],
  controllers: [VenueDashboardController],
  providers: [VenueDashboardService],
  exports: [VenueDashboardService],
})
export class VenueDashboardModule {}
