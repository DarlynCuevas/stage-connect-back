import { Controller, Post, Delete, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FollowersService } from './followers.service';

@Controller('followers')
@UseGuards(AuthGuard('jwt'))
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post(':followedId')
  async follow(@Request() req, @Param('followedId') followedId: number) {
    const followerId = req.user.user_id;
    return this.followersService.follow(followerId, followedId);
  }

  @Delete(':followedId')
  async unfollow(@Request() req, @Param('followedId') followedId: number) {
    const followerId = req.user.user_id;
    return this.followersService.unfollow(followerId, followedId);
  }

  @Get('followers-of/:userId')
  async getFollowers(@Param('userId') userId: number) {
    return this.followersService.getFollowers(userId);
  }

  @Get('following-of/:userId')
  async getFollowing(@Param('userId') userId: number) {
    return this.followersService.getFollowing(userId);
  }
}
