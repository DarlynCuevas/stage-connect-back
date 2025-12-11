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

// Enum para los estados de solicitud
export enum RequestStatus {
  PENDIENTE = 'Pending',
  ACEPTADA = 'Accepted',
  RECHAZADA = 'Rejected',
}

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con el artista (usuario que recibe la solicitud)
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist: User;

  // Relación con el local/promotor (usuario que envía la solicitud)
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  // Fecha del evento solicitado
  @Column({ type: 'date', nullable: false })
  eventDate: Date;

  // Ubicación del evento
  @Column({ type: 'varchar', length: 255, nullable: false })
  eventLocation: string;

  // Tipo de evento
  @Column({ type: 'varchar', length: 100, nullable: false })
  eventType: string;

  // Precio ofrecido
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  offeredPrice: number;

  // Detalle/mensaje de la solicitud
  @Column({ type: 'text', nullable: true })
  message: string;

  // Estado de la solicitud
  @Column({ 
    type: 'enum', 
    enum: RequestStatus,
    default: RequestStatus.PENDIENTE 
  })
  status: RequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

