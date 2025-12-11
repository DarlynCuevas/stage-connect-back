// Archivo: src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'; 
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
  ],
  providers: [UsersService],
  controllers: [UsersController],
  // 1. Exportamos el servicio para que otros módulos lo puedan INYECTAR
  // 2. Exportamos TypeOrmModule (opcional, pero buena práctica)
  exports: [UsersService, TypeOrmModule], // <--- ¡AÑADE ESTO!
})
export class UsersModule {}