import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { PrismaModule } from 'src/prisma.module';
import { JWTModule } from 'src/jwt/jwt.module';
import { UsersService } from 'src/users/users.service';
import { NotificationService } from 'src/notification/notification.service';
import { PushService } from 'src/notification/webpush.service';

@Module({
  imports: [PrismaModule, JWTModule],
  providers: [FollowersService, UsersService, NotificationService, PushService],
  controllers: [FollowersController],
})
export class FollowersModule {}
