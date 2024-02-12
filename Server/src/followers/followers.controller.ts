import { Controller, Post, Delete, UseGuards, Body } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FollowDto } from './dto/follow.dto';

@ApiTags('followers')
@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('follow')
  followUser(@Body() followDto: FollowDto) {
    return this.followersService.followUser(followDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('unfollow')
  unfollowUser(@Body() followDto: FollowDto) {
    return this.followersService.unfollowUser(followDto);
  }
}
