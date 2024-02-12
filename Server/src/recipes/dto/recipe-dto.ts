import { ApiProperty } from '@nestjs/swagger';
import { Prisma, Recipe, User } from '@prisma/client';

export class RecipeDto implements Recipe {
  @ApiProperty()
  id: number;
  @ApiProperty()
  auteur: User;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  imageUrl: string;
  @ApiProperty()
  cookTime: string;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  likes: number;
  @ApiProperty()
  category: string;
  @ApiProperty()
  date: Date;
  @ApiProperty()
  ingredients: Prisma.JsonObject;
  @ApiProperty()
  steps: Array<string>;
}
