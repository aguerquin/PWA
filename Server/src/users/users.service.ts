import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserAlreadyExistException } from 'src/auth/exceptions/useralreadyexist.exception';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User as UserModel } from '@prisma/client';
import { createHash } from 'crypto';
import { AuthProvider } from 'src/auth/providers/auth.provider';

function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserModel> {
    return this.prisma.extended.user.create({
      data: createUserDto,
    });
  }

  async createIfNotExist(
    where: Prisma.UserWhereInput,
    createUserDto: CreateUserDto,
    throwError?: () => HttpException,
  ): Promise<UserModel> {
    const user = await this.prisma.user.findFirst({ where });
    if (!user) {
      return this.create(createUserDto);
    }

    if (throwError) throw throwError();
    else throw new UserAlreadyExistException();
  }

  async updateById(
    id: number,
    user: Prisma.UserUpdateInput,
  ): Promise<UserModel> {
    return this.prisma.extended.user.update({
      data: user,
      where: { id },
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<UserModel> {
    const { where, data } = params;
    return this.prisma.user.update({ where, data });
  }

  async delete(id: number): Promise<UserModel> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(): Promise<UserModel[]> {
    return this.prisma.user.findMany();
  }

  async findOneById(
    id: number,
    include?: Prisma.UserInclude,
  ): Promise<UserModel> {
    return await this.findUnique({
      where: { id },
      include,
    });
  }

  async extendFindOneBy(args: Prisma.UserFindUniqueArgs): Promise<UserModel> {
    return await this.prisma.extended.user.findUnique(args);
  }

  async extendFindOneById(id: number): Promise<UserModel> {
    return await this.extendFindOneBy({
      where: { id },
      include: {
        followers: true,
        following: true,
      },
    });
  }

  async findOneByUsername(username: string): Promise<UserModel> {
    return await this.findUnique({
      where: { username },
    });
  }

  async findOneByEmail(email: string): Promise<UserModel> {
    return await this.prisma.user.findFirst({
      where: { email },
    });
  }

  async findUnique(args: Prisma.UserFindUniqueArgs): Promise<UserModel> {
    return await this.prisma.user.findUnique(args);
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: currentHashedRefreshToken,
      },
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.extendFindOneById(userId);

    const hashedRefreshToken = hash(refreshToken);
    const isRefreshTokenMatching = hashedRefreshToken === user.refreshToken;

    if (isRefreshTokenMatching) {
      return user;
    }
    return undefined;
  }

  async checkPasswordMatched(
    user: UserModel,
    password: string,
    errorMessage = 'Invalid email address or password',
  ) {
    const isPasswordMatched = await AuthProvider.comparePassword(
      password,
      user,
    );
    if (!isPasswordMatched) {
      throw new BadRequestException(errorMessage);
    }
  }
}
