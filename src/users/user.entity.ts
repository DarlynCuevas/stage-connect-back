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
}