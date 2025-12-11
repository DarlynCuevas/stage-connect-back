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

  // Obtener usuario por id
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { user_id: id } });
  }

  // Buscar usuarios por rol (ej. 'Artista', 'Local', 'Promotor')
  async findByRole(role: string): Promise<User[]> {
    return this.usersRepository.find({ where: { role } });
  }

  // Buscar usuarios por rol con filtros (búsqueda server-side)
  async findByRoleWithFilters(
    role: string,
    filters: {
      query?: string;
      genre?: string;
      country?: string;
      city?: string;
      priceMin?: number;
      priceMax?: number;
    },
  ): Promise<User[]> {
    const qb = this.usersRepository.createQueryBuilder('user');

    qb.where('user.role = :role', { role });

    if (filters.query) {
      const q = `%${filters.query.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.name) LIKE :q OR LOWER(user.email) LIKE :q OR LOWER(user.name) LIKE :q)',
        { q },
      );
    }

    // Para campos específicos del 'artist profile' (genre, basePrice, city, country)
    // asumimos que hay columnas en la tabla users que contienen estos campos o
    // están disponibles mediante una relación. Si no existen, estos filtros se ignoran.

    if (filters.country) {
      qb.andWhere('user.country = :country', { country: filters.country });
    }

    if (filters.city) {
      qb.andWhere('user.city = :city', { city: filters.city });
    }

    if (filters.priceMin !== undefined) {
      qb.andWhere('user.basePrice >= :priceMin', { priceMin: filters.priceMin });
    }

    if (filters.priceMax !== undefined) {
      qb.andWhere('user.basePrice <= :priceMax', { priceMax: filters.priceMax });
    }

    // Nota: para 'genre' sería ideal tener una relación/norma; si hay columna 'genre' string
    if (filters.genre) {
      qb.andWhere('user.genre ILIKE :genre', { genre: `%${filters.genre}%` });
    }

    qb.orderBy('user.created_at', 'DESC');

    const results = await qb.getMany();
    return results;
  }
}
