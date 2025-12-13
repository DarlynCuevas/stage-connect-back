import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('venue_profiles')
export class VenueProfile {
  @PrimaryColumn({ name: 'user_id' })
  user_id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: true })
  capacity?: number;

  @Column({ type: 'simple-array', nullable: true })
  amenities?: string[];

  @Column({ name: 'opening_time', type: 'varchar', length: 10, nullable: true })
  openingTime?: string;

  @Column({ name: 'closing_time', type: 'varchar', length: 10, nullable: true })
  closingTime?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string;

  @Column({ name: 'map_url', type: 'text', nullable: true })
  mapUrl?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'simple-array', nullable: true })
  gallery?: string[];

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'boolean', default: false })
  favorite: boolean;
}
