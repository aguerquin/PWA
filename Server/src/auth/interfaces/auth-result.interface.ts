import { ApiProperty } from '@nestjs/swagger';

export interface IAuthResult {
  userId: number;
  accessToken: string;
  refreshToken: string;
}

export class AuthResult implements IAuthResult {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
