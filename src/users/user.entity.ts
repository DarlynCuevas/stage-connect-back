// Archivo: src/users/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { ArtistProfile } from './artist-profile.entity';
import { ManagerProfile } from './manager-profile.entity';
import { VenueProfile } from './venue-profile.entity';
import { PromoterProfile } from './promoter-profile.entity';

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

  // Common profile fields (shared by all roles)
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banner?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender?: string;

  // Relations to profile tables (1-to-1)
  @OneToOne(() => ArtistProfile, (profile) => profile.user, { eager: false })
  artistProfile?: ArtistProfile;

  @OneToOne(() => ManagerProfile, (profile) => profile.user, { eager: false })
  managerProfile?: ManagerProfile;

  @OneToOne(() => VenueProfile, (profile) => profile.user, { eager: false })
  venueProfile?: VenueProfile;

  @OneToOne(() => PromoterProfile, (profile) => profile.user, { eager: false })
  promoterProfile?: PromoterProfile;

  // Relación con datos fiscales (1 a muchos)
  fiscalData?: import('./user-fiscal-data.entity').UserFiscalData[];

  // Relación ManyToMany para favoritos (usuarios que este usuario ha marcado como favoritos)
  @ManyToMany(() => User, (user) => user.favoritedBy)
  @JoinTable({
    name: 'user_favorites',
    joinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
    inverseJoinColumn: { name: 'favorite_user_id', referencedColumnName: 'user_id' },
  })
  favorites: User[];

  // Relación inversa: usuarios que han marcado a este usuario como favorito
  @ManyToMany(() => User, (user) => user.favorites)
  favoritedBy: User[];
}