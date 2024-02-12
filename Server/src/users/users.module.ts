import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma.module';
import { UsersController } from './users.controller';
import { JWTModule } from 'src/jwt/jwt.module';

@Module({
  imports: [PrismaModule, JWTModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
