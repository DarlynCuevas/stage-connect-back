// Archivo: src/users/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Definición de los roles (igual que en la base de datos)
export type UserRole = 'Artista' | 'Manager' | 'Local' | 'Promotor';

@Entity('users') // Nombre de la tabla en PostgreSQL
@Unique(['email']) // El email no puede repetirse
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ name: 'password_hash' }) // El nombre de la columna en la BBDD
  passwordHash: string; // Almacenará la contraseña encriptada

  @Column({
    type: 'enum',
    enum: ['Artista', 'Manager', 'Local', 'Promotor'],
    default: 'Artista',
  })
  role: UserRole;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Artist profile fields (nullable for non-artist users)
  @Column({ name: 'nick_name', type: 'varchar', length: 100, nullable: true })
  nickName?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'simple-array', nullable: true })
  genre?: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice?: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banner?: string;

  @Column({ type: 'float', default: 0, nullable: true })
  rating?: number;

  @Column({ name: 'total_shows', type: 'int', default: 0, nullable: true })
  totalShows?: number;

  @Column({ type: 'boolean', default: false })
  verified?: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender?: string;

  @Column({ name: 'manager_id', type: 'int', nullable: true })
  managerId?: number;

  @Column({ type: 'simple-json', nullable: true })
  socialLinks?: { instagram?: string; youtube?: string; spotify?: string; tiktok?: string };

  @Column({ type: 'simple-array', nullable: true })
  gallery?: string[];
}