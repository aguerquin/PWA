/*
https://docs.nestjs.com/exception-filters#custom-exceptions
*/

import { BadRequestException } from '@nestjs/common';

export class RecipeAlreadyExistException extends BadRequestException {
  constructor(error?: string) {
    super('Recipe with that email or recipe name already exists', error);
  }
}

export class RecipeEmailAlreadyExistException extends BadRequestException {
  constructor(error?: string) {
    super('Recipe with that email already exists', error);
  }
}

export class RecipeRecipenameAlreadyExistException extends BadRequestException {
  constructor(error?: string) {
    super('Recipe with that recipe name already exists', error);
  }
}
