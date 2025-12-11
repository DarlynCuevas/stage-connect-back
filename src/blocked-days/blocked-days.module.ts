import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedDay } from './blocked-day.entity';
import { BlockedDaysService } from './blocked-days.service';
import { BlockedDaysController } from './blocked-days.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedDay, User])],
  providers: [BlockedDaysService],
  controllers: [BlockedDaysController],
  exports: [BlockedDaysService],
})
export class BlockedDaysModule {}
