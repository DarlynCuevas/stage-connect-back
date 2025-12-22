import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('promoter_profiles')
export class PromoterProfile {
    @Column({ name: 'verified', type: 'boolean', default: false })
    verified?: boolean; // Si el promotor está verificado
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

  @Column({ type: 'simple-array', nullable: true })
  gallery?: string[];

  // Experiencia y Credibilidad
  @Column({ type: 'int', nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'int', nullable: true })
  totalEventsOrganized?: number;

  @Column({ type: 'text', nullable: true })
  achievements?: string;

  @Column({ type: 'simple-array', nullable: true })
  certifications?: string[];

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating?: number;

  @Column({ type: 'int', nullable: true })
  totalReviews?: number;

  // Especialización
  @Column({ type: 'simple-array', nullable: true })
  eventTypes?: string[]; // Conciertos, Festivales, Eventos corporativos, etc.

  @Column({ type: 'simple-array', nullable: true })
  musicGenres?: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  audienceSize?: string; // Pequeña (50-200), Mediana (200-1000), Grande (1000+)

  @Column({ type: 'varchar', length: 100, nullable: true })
  budgetRange?: string; // €1K-5K, €5K-20K, €20K+

  // Servicios
  @Column({ type: 'simple-array', nullable: true })
  services?: string[]; // Organización completa, Marketing, Patrocinios, etc.

  @Column({ type: 'boolean', nullable: true })
  hasVenues?: boolean; // Tiene locales propios o acceso privilegiado

  @Column({ type: 'boolean', nullable: true })
  providesMarketing?: boolean;

  @Column({ type: 'boolean', nullable: true })
  providesSponsorship?: boolean;

  // Cobertura
  @Column({ type: 'simple-array', nullable: true })
  languages?: string[];

  @Column({ type: 'simple-array', nullable: true })
  coverageAreas?: string[];

  @Column({ type: 'boolean', nullable: true })
  internationalEvents?: boolean;

  // Portfolio y Social
  @Column({ type: 'simple-array', nullable: true })
  featuredEvents?: string[]; // URLs de imágenes de eventos destacados

  @Column({ type: 'simple-array', nullable: true })
  artistsWorkedWith?: string[]; // Lista de artistas destacados

  @Column({ type: 'json', nullable: true })
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };

  // Disponibilidad
  @Column({ type: 'boolean', nullable: true })
  acceptingProjects?: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  responseTime?: string; // "24 horas", "48 horas", etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  preferredProjectSize?: string; // Solo grandes eventos, todos los tamaños, etc.
}
