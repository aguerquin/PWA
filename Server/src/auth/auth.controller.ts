import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  // Request,
  // UseGuards,
} from '@nestjs/common';
// import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { AuthResult } from './interfaces/auth-result.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
// import { AnonymousLoginDto } from './dto/anonymous-login.dto';
// import { LinkCredentialDto } from './dto/link-credential';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOkResponse({ type: AuthResult, description: 'Successfully login' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  signIn(@Body() signInDto: LoginDto): Promise<AuthResult> {
    return this.authService.signIn(signInDto);
  }

  // @HttpCode(HttpStatus.OK)
  // @Post('guest')
  // @ApiOkResponse({ type: AuthResult, description: 'Successfully login' })
  // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  // @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  // signInAnonymous(@Body() signInDto: AnonymousLoginDto): Promise<AuthResult> {
  //   return this.authService.signInAnonymous(signInDto);
  // }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  @ApiOkResponse({ type: AuthResult, description: 'Successfully registered' })
  @ApiBadRequestResponse({
    description: 'User with that email already exists.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  signUp(@Body() signUpDto: SignUpDto): Promise<AuthResult> {
    return this.authService.signUp(signUpDto);
  }

  @ApiBearerAuth()
  @Post('refresh')
  refreshToken(
    @Headers('authorization') authorization: string,
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResult> {
    return this.authService.refreshTokens(authorization, refreshTokenDto);
  }

  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  // @Post('link')
  // async linkAccount(
  //   @Request() req,
  //   @Body() credentials: LinkCredentialDto,
  // ): Promise<void> {
  //   await this.authService.linkAccount(req.user.username, credentials);
  // }
}
