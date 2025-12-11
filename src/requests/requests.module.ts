import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './request.entity';
import { User } from '../users/user.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RequestsGateway } from './requests.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request, User]), AuthModule],
  providers: [RequestsService, RequestsGateway],
  controllers: [RequestsController],
  exports: [RequestsService],
})
export class RequestsModule {}

