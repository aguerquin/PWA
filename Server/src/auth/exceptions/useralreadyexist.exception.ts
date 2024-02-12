/*
https://docs.nestjs.com/exception-filters#custom-exceptions
*/

import { BadRequestException } from '@nestjs/common';

export class UserAlreadyExistException extends BadRequestException {
  constructor(error?: string) {
    super('User with that email or username already exists', error);
  }
}

export class UserEmailAlreadyExistException extends BadRequestException {
  constructor(error?: string) {
    super('User with that email already exists', error);
  }
}

export class UserUsernameAlreadyExistException extends BadRequestException {
  constructor(error?: string) {
    super('User with that username already exists', error);
  }
}
