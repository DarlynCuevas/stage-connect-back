import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user_fiscal_data')
export class UserFiscalData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.fiscalData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'dni_nif', length: 32 })
  dniNif: string;

  @Column({ name: 'razon_social', length: 128, nullable: true })
  razonSocial?: string;

  @Column({ length: 255 })
  direccion: string;

  @Column({ length: 64 })
  ciudad: string;

  @Column({ length: 64 })
  provincia: string;

  @Column({ name: 'codigo_postal', length: 16 })
  codigoPostal: string;

  @Column({ length: 64 })
  pais: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
