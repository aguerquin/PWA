import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  NotFoundException,
  Post,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RecipesService } from './recipes.service';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeDto } from './dto/recipe-dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({ type: RecipeDto, description: 'Successfully created' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({ type: [RecipeDto], description: 'Successfully Pull' })
  @Get()
  findAll() {
    return this.recipesService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({ type: [RecipeDto], description: 'Successfully Pull' })
  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.recipesService.findByCategory(category);
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({ type: [RecipeDto], description: 'Successfully Pull' })
  @Get('users/:userId')
  findByUserId(@Param('userId') userId: number) {
    return this.recipesService.findByUserId(userId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({
    type: [RecipeDto],
    description: 'Successfully get liked recipes',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('liked')
  async getLikedRecipes(@Req() req) {
    return this.recipesService.getUserLikedRecipe(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({ type: RecipeDto, description: 'Successfully Pull' })
  @ApiNotFoundResponse({ description: 'Recipe not found' })
  @Get(':id')
  findOne(@Param('id') id: number) {
    const recipe = this.recipesService.findOneById(id);
    if (recipe === null)
      throw new NotFoundException("Can't find recipe with id: " + id);
    return recipe;
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({ type: RecipeDto, description: 'Successfully update' })
  @ApiNotFoundResponse({ description: 'Recipe not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateRecipeDto: UpdateRecipeDto) {
    const recipe = this.recipesService.findOneById(id);
    if (recipe === null)
      throw new NotFoundException("Can't find recipe with id: " + id);
    return this.recipesService.updateById(id, updateRecipeDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({ type: RecipeDto, description: 'Successfully like recipe' })
  @ApiNotFoundResponse({ description: 'Recipe not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('like/:id')
  async like(@Req() req, @Param('id') id: number) {
    return this.recipesService.likeRecipe(req.user.id, id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({
    type: RecipeDto,
    description: 'Successfully dislike recipe',
  })
  @ApiNotFoundResponse({ description: 'Recipe not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('unlike/:id')
  async dislike(@Req() req, @Param('id') id: number) {
    return this.recipesService.dislikeRecipe(req.user.id, id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Recipe not found' })
  @ApiOkResponse({ description: 'Successfully delete' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.recipesService.delete(id);
  }
}
