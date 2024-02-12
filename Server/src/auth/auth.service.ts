import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  // BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProvider } from './providers/auth.provider';
import { AuthResult } from './interfaces/auth-result.interface';
import { jwtConstants } from 'src/jwt/constants';
import { RefreshTokenDto } from './dto/refresh-token.dto';
// import { AnonymousLoginDto } from './dto/anonymous-login.dto';
// import { UserUsernameAlreadyExistException } from './exceptions/useralreadyexist.exception';
// import { LinkCredentialDto } from './dto/link-credential';
// import { generateUsername } from 'unique-username-generator';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findOneByEmail(signInDto.email);

    if (!user) throw new NotFoundException('Invalid email address or password');

    await this.usersService.checkPasswordMatched(user, signInDto.password);
    return await this.generateTokens(user);
  }

  getEmojiChars(text: string) {
    return text.match(
      /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g,
    );
  }

  // async signInAnonymous(signInDto: AnonymousLoginDto): Promise<AuthResult> {
  //   // if (this.getEmojiChars(signInDto.username)) {
  //   //   throw new BadRequestException(
  //   //     'Anonymous account cannot have emoji in username',
  //   //   );
  //   // }
  //   const username = generateUsername('', 3, 15);
  //   const user = await this.usersService.createIfNotExist(
  //     {
  //       username,
  //     },
  //     {
  //       username,
  //       guestExpireAt: this.usersService.getNewExpirationDate(),
  //     },
  //     () => new UserUsernameAlreadyExistException(),
  //   );

  //   return await this.generateTokens(user);
  // }

  async signUp(signUpDto: SignUpDto): Promise<AuthResult> {
    const hashedPassword = await AuthProvider.generateHash(signUpDto.password);
    const user = await this.usersService.createIfNotExist(
      {
        OR: [
          {
            username: signUpDto.username,
          },
          {
            email: signUpDto.email,
          },
        ],
      },
      {
        ...signUpDto,
        password: hashedPassword,
      },
    );

    return await this.generateTokens(user);
  }

  // async linkAccount(
  //   username: string,
  //   credentials: LinkCredentialDto,
  // ): Promise<void> {
  //   const user = await this.usersService.findUnique({
  //     where: {
  //       username,
  //     },
  //   });

  //   if (!user)
  //     throw new BadRequestException(
  //       `Cannot link ${username} account because it doesn't exist`,
  //     );

  //   if (user.email) {
  //     throw new BadRequestException(`User is already linked to ${user.email}`);
  //   }

  //   await this.usersService.update({
  //     where: { id: user.id },
  //     data: {
  //       email: { set: credentials.email },
  //       guestExpireAt: { set: null },
  //     },
  //   });
  // }

  async refreshTokens(
    authorization: string,
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResult> {
    try {
      const userId = await this.getUserFromAccessToken(authorization);
      await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: jwtConstants.refreshTokenSecret,
      });
      const user: User | undefined =
        await this.usersService.getUserIfRefreshTokenMatches(
          refreshTokenDto.refreshToken,
          userId,
        );

      if (!user) throw new UnauthorizedException();

      // const isLoginAsGuest = user.email === null;
      // if (isLoginAsGuest) {
      //   await this.usersService.setOrUpdateUserExpirationTime(userId);
      // }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(authorization: string): string | undefined {
    const [type, token] = authorization.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async getUserFromAccessToken(authorization: string): Promise<number> {
    const token = this.extractTokenFromHeader(authorization);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: true,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      // request['user'] = payload;

      return payload.sub;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async generateTokens(user: User): Promise<AuthResult> {
    const payload = { sub: user.id, email: user.email };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: jwtConstants.refreshTokenExpiresIn,
    });
    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

    return {
      userId: user.id,
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken,
    };
  }
}
