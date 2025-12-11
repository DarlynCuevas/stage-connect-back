// Archivo: src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserInterface } from './dto/create-user.interface';
import { Request } from '../requests/request.entity';
import { BlockedDay } from '../blocked-days/blocked-day.entity';

@Injectable()
export class UsersService {
  // Inyectamos el repositorio (interfaz de TypeORM para interactuar con la tabla)
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
    @InjectRepository(BlockedDay)
    private blockedDaysRepository: Repository<BlockedDay>,
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

  // Actualizar perfil de usuario
  async updateProfile(userId: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Merge update data
    Object.assign(user, updateData);
    
    return this.usersRepository.save(user);
  }

  // Eliminar usuario por id (propio)
  async deleteUser(userId: number): Promise<void> {
    // Remove related requests where user is artist or requester
    await this.requestsRepository.delete({ artist: { user_id: userId } as any });
    await this.requestsRepository.delete({ requester: { user_id: userId } as any });

    // Remove blocked days by this artist
    await this.blockedDaysRepository.delete({ artist: { user_id: userId } as any });

    // Finally remove user
    await this.usersRepository.delete({ user_id: userId });
  }

  // Buscar usuarios por rol (ej. 'Artista', 'Local', 'Promotor')
  async findByRole(role: string): Promise<User[]> {
    return this.usersRepository.find({ where: { role: role as UserRole } });
  }

  // Buscar usuarios por rol con filtros (búsqueda server-side)
  async findByRoleWithFilters(
    role: string,
    filters: {
      query?: string;
      genre?: string[];
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
      // Use COALESCE to treat null basePrice as 0 for comparison
      qb.andWhere('COALESCE(user.basePrice, 0) >= :priceMin', { priceMin: filters.priceMin });
    }

    if (filters.priceMax !== undefined) {
      qb.andWhere('COALESCE(user.basePrice, 0) <= :priceMax', { priceMax: filters.priceMax });
    }

    // Nota: para 'genre' sería ideal tener una relación/norma; si hay columna 'genre' string
    if (filters.genre && filters.genre.length > 0) {
      // Search for users that have ANY of the selected genres
      const genreConditions = filters.genre.map((g, i) => `user.genre ILIKE :genre${i}`);
      const genreParams = filters.genre.reduce((acc, g, i) => {
        acc[`genre${i}`] = `%${g}%`;
        return acc;
      }, {} as any);
      qb.andWhere(`(${genreConditions.join(' OR ')})`, genreParams);
    }

    qb.orderBy('user.created_at', 'DESC');

    const results = await qb.getMany();
    return results;
  }
}
