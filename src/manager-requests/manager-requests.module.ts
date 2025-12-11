import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerRequest } from './manager-request.entity';
import { ManagerRequestsService } from './manager-requests.service';
import { ManagerRequestsController } from './manager-requests.controller';
import { ManagerRequestsGateway } from './manager-requests.gateway';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagerRequest, User]),
    AuthModule,
  ],
  providers: [ManagerRequestsService, ManagerRequestsGateway],
  controllers: [ManagerRequestsController],
  exports: [ManagerRequestsService, TypeOrmModule],
})
export class ManagerRequestsModule {}
