import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;
  @IsNumber()
  @ApiProperty()
  @IsNotEmpty()
  userId: number;
  @IsString()
  @IsOptional()
  @ApiProperty()
  imageUrl?: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;
  @IsNotEmpty()
  @IsObject()
  @ApiProperty()
  ingredients: Prisma.JsonObject;
  @IsNotEmpty()
  @IsArray()
  @ApiProperty()
  steps: Array<string>;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  cookTime: string;
  @IsString()
  @IsOptional()
  @ApiProperty()
  category?: string;
}
