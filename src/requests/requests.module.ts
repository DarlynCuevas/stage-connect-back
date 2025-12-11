import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './request.entity';
import { User } from '../users/user.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Request, User])],
  providers: [RequestsService],
  controllers: [RequestsController],
  exports: [RequestsService],
})
export class RequestsModule {}

