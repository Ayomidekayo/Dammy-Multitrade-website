/*
  Warnings:

  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "description",
DROP COLUMN "price";
