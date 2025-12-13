import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'artist_id', type: 'int' })
  artistId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'artist_id' })
  artist: User;

  @Column({ name: 'reviewer_id', type: 'int' })
  reviewerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100, nullable: true })
  eventType?: string;

  @Column({ name: 'event_date', type: 'date', nullable: true })
  eventDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
