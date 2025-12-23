import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interested } from './interested.entity';
import { InterestedController } from './interested.controller';
import { NotificationsGateway } from './notifications.gateway';
import { UsersModule } from './users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interested]), UsersModule],
  controllers: [InterestedController],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class InterestedModule {}
