import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Request } from './request.entity';
import { User } from 'src/users/user.entity';


@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Request, request => request.offers, { onDelete: 'CASCADE' })
  request: Request;

  @ManyToOne(() => User, { eager: true })
  user: User; // Quien hizo la oferta (local o artista)

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20, default: 'counter' })
  type: 'initial' | 'counter' | 'final';

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ default: false })
  accepted: boolean;

  @Column({ default: false })
  rejected: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
