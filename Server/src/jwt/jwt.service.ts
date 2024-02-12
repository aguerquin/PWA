import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { jwtConstants } from './constants';

@Injectable()
export class JWTService {
  constructor(private jwtService: JwtService) {}

  async verifyAccessToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: jwtConstants.accessTokenSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: jwtConstants.refreshTokenSecret,
    });
  }
}
