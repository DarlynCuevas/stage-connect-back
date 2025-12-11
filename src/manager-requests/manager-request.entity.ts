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

export enum ManagerRequestStatus {
  PENDIENTE = 'Pending',
  ACEPTADA = 'Accepted',
  RECHAZADA = 'Rejected',
}

@Entity('manager_requests')
export class ManagerRequest {
  @PrimaryGeneratedColumn()
  id: number;

  // Usuario que envía la solicitud (puede ser manager o artista)
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  // Usuario que recibe la solicitud (puede ser manager o artista)
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  // Mensaje opcional
  @Column({ type: 'text', nullable: true })
  message: string;

  // Estado de la solicitud
  @Column({ 
    type: 'enum', 
    enum: ManagerRequestStatus,
    default: ManagerRequestStatus.PENDIENTE 
  })
  status: ManagerRequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
