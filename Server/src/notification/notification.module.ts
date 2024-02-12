import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PushService } from './webpush.service';
import { JWTModule } from 'src/jwt/jwt.module';
import { PrismaModule } from 'src/prisma.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [PrismaModule, JWTModule],
  controllers: [NotificationController],
  providers: [NotificationService, PushService, UsersService],
})
export class NotificationModule {}
