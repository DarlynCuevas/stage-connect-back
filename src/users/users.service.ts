// Archivo: src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserInterface } from './dto/create-user.interface';

@Injectable()
export class UsersService {
  // Inyectamos el repositorio (interfaz de TypeORM para interactuar con la tabla)
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Método usado por AuthService para verificar si el email ya existe
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Método usado por AuthService para crear el registro
  async create(createUserDto: CreateUserInterface): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto); 
    return this.usersRepository.save(newUser);
  }

  // Otros métodos de usuario...
}