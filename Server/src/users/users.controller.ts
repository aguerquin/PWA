import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordUserDto } from './dto/update-password.dto';
import { AuthProvider } from 'src/auth/providers/auth.provider';
import { UserDto } from './dto/user-dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':userId')
  getUserById(@Param('userId') userId: number) {
    return this.usersService.extendFindOneById(userId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':userId')
  updateUser(
    @Param('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateById(userId, updateUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto, description: 'Successfully login' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Invalid Password' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':userId/changePassword')
  async changePassword(
    @Param('userId') userId: number,
    @Body() updatePasswordDto: UpdatePasswordUserDto,
  ) {
    const user = await this.usersService.findOneById(userId);
    if (user === null)
      throw new NotFoundException("Can't find user with id: " + userId);

    await this.usersService.checkPasswordMatched(
      user,
      updatePasswordDto.currentPassword,
      'Invalid Password',
    );

    const hashedPassword = await AuthProvider.generateHash(
      updatePasswordDto.newPassword,
    );
    return this.usersService.updateById(userId, {
      password: hashedPassword,
    });
  }
}
