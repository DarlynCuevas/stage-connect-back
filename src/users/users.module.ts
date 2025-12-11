// Archivo: src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'; 
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PublicUsersController } from './public-users.controller';
import { Request } from '../requests/request.entity';
import { BlockedDay } from '../blocked-days/blocked-day.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Request, BlockedDay]), 
  ],
  providers: [UsersService],
  controllers: [UsersController, PublicUsersController],
  // 1. Exportamos el servicio para que otros módulos lo puedan INYECTAR
  // 2. Exportamos TypeOrmModule (opcional, pero buena práctica)
  exports: [UsersService, TypeOrmModule], // <--- ¡AÑADE ESTO!
})
export class UsersModule {}