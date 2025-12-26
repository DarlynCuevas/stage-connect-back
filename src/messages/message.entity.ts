import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Conversation } from './conversation.entity';


@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversationId: number;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  senderId: number;


  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId', referencedColumnName: 'user_id' })
  sender: User;

  @Column()
  receiverId: number;


  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId', referencedColumnName: 'user_id' })
  receiver: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  read: boolean;
}
