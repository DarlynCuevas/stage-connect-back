import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('manager_profiles')
export class ManagerProfile {
  @PrimaryColumn({ name: 'user_id' })
  user_id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 200, nullable: true })
  company?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  website?: string;

  // Experiencia y Credenciales
  @Column({ name: 'years_of_experience', type: 'int', nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'simple-array', nullable: true })
  specializations?: string[]; // Géneros o tipos de artistas que maneja

  @Column({ type: 'simple-array', nullable: true })
  achievements?: string[]; // Premios, reconocimientos

  // Portafolio
  @Column({ name: 'current_artists', type: 'int', default: 0 })
  currentArtists?: number; // Número de artistas actualmente bajo gestión

  @Column({ name: 'total_shows_managed', type: 'int', default: 0 })
  totalShowsManaged?: number; // Total de shows gestionados

  @Column({ type: 'float', default: 0, nullable: true })
  rating?: number; // Valoración del manager

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews?: number;

  // Servicios
  @Column({ type: 'simple-array', nullable: true })
  services?: string[]; // Servicios que ofrece: booking, promotion, contract negotiation, etc.

  @Column({ name: 'commission_rate', type: 'varchar', length: 50, nullable: true })
  commissionRate?: string; // Tasa de comisión (ej: "15-20%")

  // Cobertura
  @Column({ type: 'simple-array', nullable: true })
  languages?: string[];

  @Column({ name: 'coverage_areas', type: 'simple-array', nullable: true })
  coverageAreas?: string[]; // Ciudades/regiones donde opera

  @Column({ name: 'international_booking', type: 'boolean', default: false })
  internationalBooking?: boolean;

  // Multimedia
  @Column({ type: 'simple-array', nullable: true })
  portfolio?: string[]; // URLs de casos de éxito, eventos gestionados

  @Column({ name: 'social_links', type: 'simple-json', nullable: true })
  socialLinks?: { linkedin?: string; instagram?: string; facebook?: string; twitter?: string };

  // Contacto y disponibilidad
  @Column({ name: 'accepting_artists', type: 'boolean', default: true })
  acceptingArtists?: boolean; // Si está buscando nuevos artistas

  @Column({ name: 'featured', type: 'boolean', default: false })
  featured?: boolean; // Si es un manager destacado

  @Column({ name: 'response_time', type: 'varchar', length: 50, nullable: true })
  responseTime?: string; // "Responde en menos de 24h"
}
