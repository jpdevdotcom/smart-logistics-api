/*
  Warnings:

  - You are about to alter the column `sku` on the `items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(11)`.

*/
-- AlterTable
ALTER TABLE "items" ALTER COLUMN "sku" SET DATA TYPE VARCHAR(11);
