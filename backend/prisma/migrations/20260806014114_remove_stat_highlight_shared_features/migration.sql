/*
  Warnings:

  - You are about to drop the column `phone` on the `buyer_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `shared_features` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `product_stat_highlights` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_stat_highlights" DROP CONSTRAINT "product_stat_highlights_product_id_fkey";

-- AlterTable
ALTER TABLE "buyer_profiles" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "shared_features";

-- DropTable
DROP TABLE "product_stat_highlights";
