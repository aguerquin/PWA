import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnonymousLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  deviceId: string;
}
