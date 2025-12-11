import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('blocked_days')
export class BlockedDay {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con el artista
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist: User;

  // Fecha bloqueada
  @Column({ type: 'date', nullable: false })
  blockedDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
