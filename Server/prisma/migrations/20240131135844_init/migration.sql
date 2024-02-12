/*
  Warnings:

  - Made the column `cookTime` on table `Recipe` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "imageUrl" SET DEFAULT 'https://w7.pngwing.com/pngs/818/61/png-transparent-knife-fork-plate-spoon-knife-plate-logo-fork.png',
ALTER COLUMN "cookTime" SET NOT NULL,
ALTER COLUMN "likes" SET DEFAULT 0;
