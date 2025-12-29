import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Type } from 'class-transformer';
import { VenueProfile } from './users/venue-profile.entity';
import { User } from './users/user.entity';
import { ArtistProfile } from './users/artist-profile.entity';


export type InterestedStatus = 'pending' | 'interested' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';

@Entity()
export class Interested {
  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  venueId: number;
  @ManyToOne(() => VenueProfile, { nullable: false })
  @JoinColumn({ name: 'venueId' })
  venue: VenueProfile;


  @Column({ nullable: true })
  managerId: number | null;
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager: User | null;


  @Column()
  artistId: number;
  @Type(() => ArtistProfile)
  @ManyToOne(() => ArtistProfile, { nullable: false })
  @JoinColumn({ name: 'artistId' })
  artist: ArtistProfile;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', nullable: true })
  price: number | null;

  @Column({ type: 'varchar', default: 'pending' })
  status: InterestedStatus;

  @CreateDateColumn()
  createdAt: Date;
}
