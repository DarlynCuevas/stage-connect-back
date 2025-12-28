import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from './follower.entity';
import { User } from './user.entity';
import { sanitizeUserResponse } from './users.service';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follower)
    private followersRepository: Repository<Follower>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async follow(followerId: number, followedId: number) {
    if (followerId === followedId) throw new Error('No puedes seguirte a ti mismo');
    const follower = await this.usersRepository.findOne({ where: { user_id: followerId } });
    const followed = await this.usersRepository.findOne({ where: { user_id: followedId } });
    if (!follower || !followed) throw new Error('Usuario no encontrado');
    const exists = await this.followersRepository.findOne({ where: { follower: { user_id: followerId }, followed: { user_id: followedId } } });
    if (exists) return { message: 'Ya sigues a este usuario' };
    const follow = this.followersRepository.create({ follower, followed });
    await this.followersRepository.save(follow);
    return { message: 'Ahora sigues a este usuario' };
  }

  async unfollow(followerId: number, followedId: number) {
    const follow = await this.followersRepository.findOne({ where: { follower: { user_id: followerId }, followed: { user_id: followedId } } });
    if (!follow) return { message: 'No sigues a este usuario' };
    await this.followersRepository.remove(follow);
    return { message: 'Has dejado de seguir a este usuario' };
  }

  async getFollowers(userId: number) {
    // LEFT JOIN a artist_profiles para obtener nickName si es artista
    const followers = await this.followersRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.follower', 'user')
      .leftJoinAndSelect('user.artistProfile', 'artistProfile')
      .where('f.followed = :userId', { userId })
      .getMany();
    return followers.map(f => {
      const user = f.follower;
      const sanitized = sanitizeUserResponse(user);
      if (user.artistProfile && user.artistProfile.nickName) {
        sanitized.nickName = user.artistProfile.nickName;
      }
      // Asegura que avatar esté presente
      sanitized.avatar = user.avatar;
      return sanitized;
    });
  }

  async getFollowing(userId: number) {
    const following = await this.followersRepository.find({ where: { follower: { user_id: userId } }, relations: ['followed'] });
    return following.map(f => sanitizeUserResponse(f.followed));
  }
}
