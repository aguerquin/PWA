import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  // Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/auth.guard';
// import { NotificationDto } from './dto/notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  private subscribe(@Req() req, @Body() subscriptionDto) {
    this.notificationService.subscribe(req.user.id, subscriptionDto);
  }

  // @Post('send/:id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // private send(@Param('id') id: number) {
  //   const payload: NotificationDto = {
  //     title: 'Notification Test',
  //     body: 'Votre message',
  //     icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
  //   };
  //   this.notificationService.sendNotificationToUser(id, payload);
  // }

  @Get('vapidPublicKey')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  private getVapidPublicKey() {
    return this.notificationService.getVapidPublicKey();
  }
}
