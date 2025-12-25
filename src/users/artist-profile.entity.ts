
import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Type } from 'class-transformer';
import { User } from './user.entity';

@Entity('artist_profiles')
export class ArtistProfile {
  @PrimaryColumn({ name: 'user_id' })
  user_id: number;

  @Type(() => User)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'nick_name', type: 'varchar', length: 100, nullable: true })
  nickName?: string;

  @Column({ type: 'boolean', default: false })
  featured?: boolean;

  @Column({ type: 'simple-array', nullable: true })
  genre?: string[];
  @Column({ name: 'total_income_this_year', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalIncomeThisYear?: number;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice?: number;

  @Column({ name: 'allow_negotiation', type: 'boolean', default: false })
  allowNegotiation?: boolean;

  @Column({ type: 'float', default: 0, nullable: true })
  rating?: number;

  @Column({ name: 'total_shows', type: 'int', default: 0, nullable: true })
  totalShows?: number;

  @Column({ type: 'boolean', default: false })
  verified?: boolean;

  @Column({ name: 'manager_id', type: 'int', nullable: true })
  managerId: number | null;

  @Column({ type: 'simple-json', nullable: true })
  socialLinks?: { instagram?: string; youtube?: string; spotify?: string; tiktok?: string };

  @Column({ type: 'simple-array', nullable: true })
  gallery?: string[];

  // Tipo de artista (Artista, DJ, etc)
  @Column({ type: 'varchar', length: 50, nullable: true })
  type?: string;
  // Credibilidad y Experiencia
  @Column({ name: 'years_of_experience', type: 'int', nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'simple-array', nullable: true })
  achievements?: string[];

  @Column({ type: 'simple-array', nullable: true })
  certifications?: string[];

  // Multimedia
  @Column({ name: 'showreel_url', type: 'text', nullable: true })
  showreelUrl?: string;

  @Column({ name: 'spotify_url', type: 'text', nullable: true })
  spotifyUrl?: string;

  @Column({ name: 'youtube_channel', type: 'text', nullable: true })
  youtubeChannel?: string;

  // Información Técnica
  @Column({ name: 'technical_rider', type: 'text', nullable: true })
  technicalRider?: string;

  @Column({ type: 'simple-array', nullable: true })
  equipment?: string[];

  @Column({ name: 'setup_time', type: 'varchar', length: 50, nullable: true })
  setupTime?: string;

  // Cobertura
  @Column({ type: 'simple-array', nullable: true })
  languages?: string[];

  @Column({ name: 'coverage_areas', type: 'simple-array', nullable: true })
  coverageAreas?: string[];

  @Column({ name: 'willing_to_travel', type: 'boolean', default: false })
  willingToTravel?: boolean;

  // Profesional
  @Column({ name: 'performance_types', type: 'simple-array', nullable: true })
  performanceTypes?: string[];

  @Column({ name: 'audience_size', type: 'varchar', length: 50, nullable: true })
  audienceSize?: string;

  @Column({ name: 'set_duration', type: 'varchar', length: 50, nullable: true })
  setDuration?: string;
}
