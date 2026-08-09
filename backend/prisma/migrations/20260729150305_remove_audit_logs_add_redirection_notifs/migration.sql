/*
  Warnings:

  - The values [failed] on the enum `payment_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `admin_id` on the `admin_settings` table. All the data in the column will be lost.
  - You are about to drop the column `buyer_id` on the `buyer_addresses` table. All the data in the column will be lost.
  - The primary key for the `buyer_notification_reads` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `buyer_id` on the `buyer_notification_reads` table. All the data in the column will be lost.
  - You are about to drop the column `action_link` on the `buyer_notifications` table. All the data in the column will be lost.
  - You are about to drop the column `buyer_id` on the `buyer_notifications` table. All the data in the column will be lost.
  - You are about to drop the column `buyer_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `buyer_id` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `buyer_id` on the `support_tickets` table. All the data in the column will be lost.
  - You are about to drop the column `buyer_id` on the `user_subscriptions` table. All the data in the column will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `buyers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[admin_profile_id]` on the table `admin_settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admin_profile_id` to the `admin_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_profile_id` to the `buyer_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_profile_id` to the `buyer_notification_reads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_profile_id` to the `support_tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_profile_id` to the `user_subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'buyer');

-- AlterEnum
ALTER TYPE "image_folder" ADD VALUE 'profiles';

-- AlterEnum
ALTER TYPE "message_status" ADD VALUE 'replied';

-- AlterEnum
BEGIN;
CREATE TYPE "payment_status_new" AS ENUM ('pending', 'paid', 'refunded', 'partially_refunded');
ALTER TABLE "public"."orders" ALTER COLUMN "payment_status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "payment_status" TYPE "payment_status_new" USING ("payment_status"::text::"payment_status_new");
ALTER TYPE "payment_status" RENAME TO "payment_status_old";
ALTER TYPE "payment_status_new" RENAME TO "payment_status";
DROP TYPE "public"."payment_status_old";
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
ALTER TYPE "product_status" ADD VALUE 'archived';

-- AlterEnum
ALTER TYPE "support_priority" ADD VALUE 'critical';

-- AlterEnum
ALTER TYPE "usage_model" ADD VALUE 'profile';

-- DropForeignKey
ALTER TABLE "admin_settings" DROP CONSTRAINT "admin_settings_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "buyer_addresses" DROP CONSTRAINT "buyer_addresses_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "buyer_notification_reads" DROP CONSTRAINT "buyer_notification_reads_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "buyer_notifications" DROP CONSTRAINT "buyer_notifications_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_buyer_id_fkey";

-- DropIndex
DROP INDEX "admin_settings_admin_id_key";

-- DropIndex
DROP INDEX "buyer_addresses_buyer_id_idx";

-- DropIndex
DROP INDEX "buyer_notification_reads_buyer_id_idx";

-- DropIndex
DROP INDEX "buyer_notifications_audience_created_at_idx";

-- DropIndex
DROP INDEX "buyer_notifications_buyer_id_created_at_idx";

-- DropIndex
DROP INDEX "buyer_notifications_buyer_id_status_idx";

-- DropIndex
DROP INDEX "orders_buyer_id_idx";

-- DropIndex
DROP INDEX "orders_order_status_payment_status_idx";

-- DropIndex
DROP INDEX "support_tickets_buyer_id_created_at_idx";

-- DropIndex
DROP INDEX "user_subscriptions_buyer_id_idx";

-- DropIndex
DROP INDEX "user_subscriptions_stripe_customer_id_idx";

-- AlterTable
ALTER TABLE "admin_settings" DROP COLUMN "admin_id",
ADD COLUMN     "admin_profile_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "buyer_addresses" DROP COLUMN "buyer_id",
ADD COLUMN     "buyer_profile_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "buyer_notification_reads" DROP CONSTRAINT "buyer_notification_reads_pkey",
DROP COLUMN "buyer_id",
ADD COLUMN     "buyer_profile_id" UUID NOT NULL,
ADD CONSTRAINT "buyer_notification_reads_pkey" PRIMARY KEY ("notification_id", "buyer_profile_id");

-- AlterTable
ALTER TABLE "buyer_notifications" DROP COLUMN "action_link",
DROP COLUMN "buyer_id",
ADD COLUMN     "action_url" VARCHAR(255),
ADD COLUMN     "buyer_profile_id" UUID,
ADD COLUMN     "entity_id" VARCHAR(255),
ADD COLUMN     "entity_type" VARCHAR(50);

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "buyer_id",
ADD COLUMN     "buyer_profile_id" UUID;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "buyer_id",
ADD COLUMN     "buyer_profile_id" UUID;

-- AlterTable
ALTER TABLE "support_tickets" DROP COLUMN "buyer_id",
ADD COLUMN     "buyer_profile_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "user_subscriptions" DROP COLUMN "buyer_id",
ADD COLUMN     "buyer_profile_id" UUID NOT NULL;

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "buyers";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'buyer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "last_password_change" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "lock_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "singleton" BOOLEAN NOT NULL DEFAULT true,
    "name" VARCHAR(50) NOT NULL,
    "last_action" VARCHAR(150),
    "last_action_at" TIMESTAMP(3),
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "pending_two_factor_session" TEXT,
    "pending_two_factor_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "notification_type" NOT NULL DEFAULT 'system',
    "title" VARCHAR(120) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "status" "notification_status" NOT NULL DEFAULT 'unread',
    "action_url" VARCHAR(255),
    "entity_type" VARCHAR(50),
    "entity_id" VARCHAR(255),
    "meta" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(40) NOT NULL,
    "last_name" VARCHAR(40) NOT NULL,
    "phone" VARCHAR(30),
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "resend_count" INTEGER NOT NULL DEFAULT 0,
    "resend_window_start" TIMESTAMP(3),
    "forgot_password_count" INTEGER NOT NULL DEFAULT 0,
    "forgot_password_window_start" TIMESTAMP(3),
    "verification_code" TEXT,
    "verification_expires" TIMESTAMP(3),
    "stripe_customer_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_role_idx" ON "users"("email", "role");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_user_id_key" ON "admin_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_singleton_key" ON "admin_profiles"("singleton");

-- CreateIndex
CREATE INDEX "admin_notifications_status_created_at_idx" ON "admin_notifications"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "buyer_profiles_user_id_key" ON "buyer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_settings_admin_profile_id_key" ON "admin_settings"("admin_profile_id");

-- CreateIndex
CREATE INDEX "buyer_addresses_buyer_profile_id_idx" ON "buyer_addresses"("buyer_profile_id");

-- CreateIndex
CREATE INDEX "buyer_notifications_buyer_profile_id_created_at_idx" ON "buyer_notifications"("buyer_profile_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "buyer_notifications_buyer_profile_id_status_idx" ON "buyer_notifications"("buyer_profile_id", "status");

-- CreateIndex
CREATE INDEX "orders_buyer_profile_id_idx" ON "orders"("buyer_profile_id");

-- CreateIndex
CREATE INDEX "support_tickets_buyer_profile_id_created_at_idx" ON "support_tickets"("buyer_profile_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "user_subscriptions_buyer_profile_id_idx" ON "user_subscriptions"("buyer_profile_id");

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_settings" ADD CONSTRAINT "admin_settings_admin_profile_id_fkey" FOREIGN KEY ("admin_profile_id") REFERENCES "admin_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_profiles" ADD CONSTRAINT "buyer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_addresses" ADD CONSTRAINT "buyer_addresses_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_notifications" ADD CONSTRAINT "buyer_notifications_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_notification_reads" ADD CONSTRAINT "buyer_notification_reads_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
