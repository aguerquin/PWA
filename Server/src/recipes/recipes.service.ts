import { HttpException, Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Prisma, Recipe as RecipeModel } from '@prisma/client';
import { RecipeAlreadyExistException } from 'src/auth/exceptions/recipealreadyexist.exception';
import { PrismaService } from 'src/prisma.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<RecipeModel> {
    const recipe = await this.prisma.recipe.create({
      data: createRecipeDto,
    });

    const author = await this.prisma.user.findUnique({
      where: { id: recipe.userId },
      include: { following: true },
    });

    author.following.forEach((user) => {
      this.notificationService.sendNotificationToUser(user.id, {
        title: 'Nouvelle recette',
        body: 'Un utilisateur que vous suivez a publié une nouvelle recette',
        icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
      });
    });
    return recipe;
  }

  async createIfNotExist(
    where: Prisma.RecipeWhereInput,
    createRecipeDto: CreateRecipeDto,
    throwError?: () => HttpException,
  ): Promise<RecipeModel> {
    const recipe = await this.prisma.recipe.findFirst({ where });
    if (!recipe) {
      return this.create(createRecipeDto);
    }

    if (throwError) throw throwError();
    else throw new RecipeAlreadyExistException();
  }

  async updateById(
    id: number,
    recipe: Prisma.RecipeUpdateInput,
  ): Promise<RecipeModel> {
    return this.prisma.extended.recipe.update({
      data: recipe,
      where: { id },
    });
  }

  async update(params: {
    where: Prisma.RecipeWhereUniqueInput;
    data: Prisma.RecipeUpdateInput;
  }): Promise<RecipeModel> {
    const { where, data } = params;
    return this.prisma.recipe.update({ where, data });
  }

  async delete(id: number): Promise<RecipeModel> {
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new HttpException('Recipe not found.', 404);
    }

    await this.prisma.likeRecipe.deleteMany({
      where: {
        recipeId: id,
      },
    });
    return this.prisma.recipe.delete({
      where: { id },
    });
  }

  async findAll(): Promise<RecipeModel[]> {
    return this.prisma.extended.recipe.findMany({
      include: { author: true },
    });
  }

  async findOneById(id: number): Promise<RecipeModel> {
    return await this.prisma.extended.recipe.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  async extendFindOneById(id: number): Promise<RecipeModel> {
    return await this.prisma.extended.recipe.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  async findByUserId(userId: number): Promise<RecipeModel[]> {
    return await this.prisma.extended.recipe.findMany({
      where: { userId },
      include: { author: true },
    });
  }

  async findByCategory(category: string): Promise<RecipeModel[]> {
    return await this.prisma.extended.recipe.findMany({
      where: { category },
      include: { author: true },
    });
  }

  async findUnique(args: Prisma.RecipeFindUniqueArgs): Promise<RecipeModel> {
    return await this.prisma.recipe.findUnique(args);
  }

  async getUserLikedRecipe(userId: number): Promise<RecipeModel[]> {
    return await this.prisma.extended.recipe.findMany({
      where: { recipeLikes: { some: { userId } } },
      include: { author: true },
    });
  }

  async likeRecipe(userId: number, recipeId: number): Promise<RecipeModel> {
    const existingLike = await this.prisma.likeRecipe.findUnique({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    if (existingLike) {
      throw new HttpException('User has already liked this recipe.', 400);
    }

    await this.prisma.likeRecipe.create({
      data: {
        userId,
        recipeId,
      },
    });

    const likeCount = await this.prisma.likeRecipe.count({
      where: {
        recipeId: recipeId,
      },
    });

    const recipe = await this.prisma.recipe.update({
      where: { id: recipeId },
      data: {
        likes: likeCount,
      },
    });

    this.notificationService.sendNotificationToUser(recipe.userId, {
      title: 'Nouveaux like',
      body: 'Un utilisateur a aimé votre recette',
      icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
    });

    return recipe;
  }

  async dislikeRecipe(userId: number, recipeId: number): Promise<RecipeModel> {
    const existingLike = await this.prisma.likeRecipe.findUnique({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    if (!existingLike) {
      throw new HttpException('User has not liked this recipe.', 400);
    }

    await this.prisma.likeRecipe.delete({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    const likeCount = await this.prisma.likeRecipe.count({
      where: {
        recipeId: recipeId,
      },
    });

    return this.prisma.recipe.update({
      where: { id: recipeId },
      data: {
        likes: likeCount,
      },
    });
  }
}
