import { HttpException, Injectable } from '@nestjs/common';
import { PushService } from './webpush.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly pushService: PushService,
    private prisma: PrismaService,
  ) {}

  async createSubscriptionIfNotExist(
    where: Prisma.SubscriptionWhereInput,
    userId: number,
    subscriptionDto: any,
    throwError?: () => HttpException,
  ) {
    const recipe = await this.prisma.subscription.findFirst({ where });
    if (!recipe) {
      return await this.prisma.subscription.create({
        data: {
          endpoint: subscriptionDto.endpoint,
          expirationTime: subscriptionDto.expirationTime,
          keys: subscriptionDto.keys,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }

    if (throwError) throw throwError();
  }

  async subscribe(userId: number, subscriptionDto: any) {
    await this.createSubscriptionIfNotExist(
      {
        endpoint: subscriptionDto.endpoint,
      },
      userId,
      subscriptionDto,
    );
  }

  async sendNotificationToUser(userId: number, payload: NotificationDto) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
      },
    });
    if (subscriptions.length === 0) return;

    subscriptions.forEach((subscription) => {
      this.sendNotification(
        {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime,
          keys: subscription.keys,
        },
        payload,
      ).catch((error) => console.error(error));
    });
  }

  async sendNotification(subscriptionDto: any, payload: NotificationDto) {
    return this.pushService.sendNotification(
      subscriptionDto,
      JSON.stringify(payload),
    );
  }

  async getVapidPublicKey() {
    return this.pushService.getVapidPublicKey();
  }
}
