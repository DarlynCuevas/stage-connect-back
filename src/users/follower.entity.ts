import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('followers')
@Unique(['follower', 'followed'])
export class Follower {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  follower: User;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  followed: User;
}
