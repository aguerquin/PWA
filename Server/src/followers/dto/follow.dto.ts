import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FollowDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  followerId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  followingId: number;
}
