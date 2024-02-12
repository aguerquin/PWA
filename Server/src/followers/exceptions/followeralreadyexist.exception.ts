import { BadRequestException } from '@nestjs/common';

export class FollowerAlreadyExistException extends BadRequestException {
  constructor(error?: string) {
    super('The follower already follow the following user', error);
  }
}
