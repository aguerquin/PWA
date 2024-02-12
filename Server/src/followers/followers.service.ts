import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Follower as FollowerModel } from '@prisma/client';
import { FollowDto } from './dto/follow.dto';
import { NotificationService } from 'src/notification/notification.service';
import { FollowerAlreadyExistException } from './exceptions/followeralreadyexist.exception';

@Injectable()
export class FollowersService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async followUser(followDto: FollowDto): Promise<FollowerModel> {
    const found = await this.prisma.follower.findFirst({
      where: {
        followerId: followDto.followerId,
        followingId: followDto.followingId,
      },
    });

    if (found) throw new FollowerAlreadyExistException();

    this.notificationService.sendNotificationToUser(followDto.followingId, {
      title: 'Nouveau follower',
      body: 'Vous avez un nouveau follower',
      icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
    });
    return this.prisma.follower.create({
      data: {
        followerId: followDto.followerId,
        followingId: followDto.followingId,
      },
    });
  }

  async unfollowUser(followDto: FollowDto): Promise<FollowerModel> {
    return this.prisma.follower.delete({
      where: {
        followerId_followingId: {
          followerId: followDto.followerId,
          followingId: followDto.followingId,
        },
      },
    });
  }

  // Additional methods like getFollowers, getFollowing can be added here.
}
