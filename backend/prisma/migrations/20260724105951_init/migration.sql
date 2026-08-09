-- CreateEnum
CREATE TYPE "image_folder" AS ENUM ('products', 'categories', 'order_items');

-- CreateEnum
CREATE TYPE "usage_model" AS ENUM ('product', 'category', 'order');

-- CreateEnum
CREATE TYPE "label_variant" AS ENUM ('primary', 'secondary', 'accent', 'purple', 'green', 'blue', 'orange');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('active', 'draft');

-- CreateEnum
CREATE TYPE "category_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cod', 'card', 'bank_transfer', 'digital_wallet', 'installments');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "payment_intent_status" AS ENUM ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled', 'failed');

-- CreateEnum
CREATE TYPE "review_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "subscription_duration" AS ENUM ('days', 'weeks', 'months', 'years');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('order', 'billing', 'support', 'system');

-- CreateEnum
CREATE TYPE "notification_audience" AS ENUM ('individual', 'all_buyers');

-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('unread', 'read', 'archived');

-- CreateEnum
CREATE TYPE "message_status" AS ENUM ('unread', 'read');

-- CreateEnum
CREATE TYPE "support_category" AS ENUM ('order', 'payment', 'account', 'shipping', 'other');

-- CreateEnum
CREATE TYPE "support_priority" AS ENUM ('low', 'normal', 'high');

-- CreateEnum
CREATE TYPE "support_status" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "support_sender" AS ENUM ('buyer', 'admin');

-- CreateEnum
CREATE TYPE "currency_code" AS ENUM ('USD', 'GBP', 'EUR', 'PKR', 'INR');

-- CreateEnum
CREATE TYPE "language_code" AS ENUM ('en', 'pt', 'ur', 'es', 'fr');

-- CreateEnum
CREATE TYPE "date_format_type" AS ENUM ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD');

-- CreateEnum
CREATE TYPE "theme_mode" AS ENUM ('light', 'dark', 'auto');

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "singleton" BOOLEAN NOT NULL DEFAULT true,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "last_password_change" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "lock_until" TIMESTAMP(3),
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "pending_two_factor_session" TEXT,
    "pending_two_factor_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" UUID NOT NULL,
    "profile_name" VARCHAR(50),
    "profile_email" VARCHAR(255),
    "profile_picture" TEXT,
    "pref_currency" "currency_code" NOT NULL DEFAULT 'USD',
    "pref_language" "language_code" NOT NULL DEFAULT 'en',
    "pref_timezone_auto" BOOLEAN NOT NULL DEFAULT true,
    "pref_timezone_manual" VARCHAR(10) NOT NULL DEFAULT '+05:00',
    "pref_date_format" "date_format_type" NOT NULL DEFAULT 'DD/MM/YYYY',
    "notif_email_alerts" BOOLEAN NOT NULL DEFAULT true,
    "notif_order_alerts" BOOLEAN NOT NULL DEFAULT true,
    "notif_low_stock_alerts" BOOLEAN NOT NULL DEFAULT true,
    "notif_customer_alerts" BOOLEAN NOT NULL DEFAULT false,
    "notif_system_alerts" BOOLEAN NOT NULL DEFAULT true,
    "theme_mode" "theme_mode" NOT NULL DEFAULT 'light',
    "theme_sidebar_collapsed" BOOLEAN NOT NULL DEFAULT false,
    "security_two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "security_session_timeout_min" INTEGER NOT NULL DEFAULT 30,
    "security_last_password_change" TIMESTAMP(3),
    "discount_enabled" BOOLEAN NOT NULL DEFAULT false,
    "discount_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_banner_text" VARCHAR(120) NOT NULL DEFAULT '',
    "discount_start_date" TIMESTAMP(3),
    "discount_end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(40) NOT NULL,
    "last_name" VARCHAR(40) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
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

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyer_id" UUID NOT NULL,
    "label" VARCHAR(30) NOT NULL DEFAULT 'Home',
    "full_name" VARCHAR(80),
    "phone" VARCHAR(20),
    "address1" VARCHAR(120) NOT NULL,
    "address2" VARCHAR(120),
    "city" VARCHAR(60) NOT NULL,
    "state" VARCHAR(60) NOT NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(60) NOT NULL DEFAULT 'Pakistan',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "path" TEXT NOT NULL,
    "folder" "image_folder" NOT NULL,
    "sha256" CHAR(64) NOT NULL,
    "phash" VARCHAR(16),
    "size_bytes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_asset_usages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "image_id" UUID NOT NULL,
    "model" "usage_model" NOT NULL,
    "doc_id" UUID NOT NULL,
    "field" VARCHAR(60) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_asset_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "image_id" UUID,
    "status" "category_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "sku" VARCHAR(40) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "original_price" DECIMAL(12,2),
    "category_id" UUID NOT NULL,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shared_features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "delivery_charges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delivery_rule" TEXT NOT NULL DEFAULT '',
    "insurance_details" TEXT NOT NULL DEFAULT '',
    "usage_instructions" TEXT NOT NULL DEFAULT '',
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "specifications" JSONB NOT NULL DEFAULT '{}',
    "status" "product_status" NOT NULL DEFAULT 'active',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "average_rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "admin_notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "search_vector" tsvector,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "image_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_labels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "text" VARCHAR(60) NOT NULL,
    "variant" "label_variant" NOT NULL DEFAULT 'primary',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_nutrition_facts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "value" VARCHAR(60) NOT NULL,
    "unit" VARCHAR(20) NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_nutrition_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_benefits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(20) NOT NULL DEFAULT '✓',
    "learn_more_url" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "question" VARCHAR(300) NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_stat_highlights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(60) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_stat_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyer_id" UUID,
    "customer_name" VARCHAR(150) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(30) NOT NULL,
    "shipping_address1" VARCHAR(120) NOT NULL,
    "shipping_address2" VARCHAR(120),
    "shipping_city" VARCHAR(60) NOT NULL,
    "shipping_state" VARCHAR(60) NOT NULL,
    "shipping_postal_code" VARCHAR(20) NOT NULL,
    "shipping_country" VARCHAR(60) NOT NULL DEFAULT 'Pakistan',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "delivery_charges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "order_status" "order_status" NOT NULL DEFAULT 'pending',
    "payment_method" "payment_method" NOT NULL DEFAULT 'cod',
    "payment_status" "payment_status" NOT NULL DEFAULT 'pending',
    "stripe_payment_intent_id" VARCHAR(255),
    "stripe_charge_id" VARCHAR(255),
    "stripe_customer_id" VARCHAR(255),
    "payment_intent_status" "payment_intent_status",
    "orderNotes" TEXT,
    "order_number" VARCHAR(20) NOT NULL,
    "tracking_number" VARCHAR(100),
    "review_reminder_count" SMALLINT NOT NULL DEFAULT 0,
    "first_reminder_sent_at" TIMESTAMP(3),
    "second_reminder_sent_at" TIMESTAMP(3),
    "review_submitted" BOOLEAN NOT NULL DEFAULT false,
    "review_submitted_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" VARCHAR(200) NOT NULL,
    "product_image" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "original_price_snapshot" DECIMAL(12,2),
    "global_discount_applied" BOOLEAN NOT NULL DEFAULT false,
    "global_discount_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "delivery_charges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_subscription" BOOLEAN NOT NULL DEFAULT false,
    "subscription_discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "buyer_id" UUID,
    "user_name" VARCHAR(150) NOT NULL,
    "user_email" VARCHAR(255) NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT NOT NULL,
    "status" "review_status" NOT NULL DEFAULT 'approved',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL DEFAULT '',
    "price" DECIMAL(12,2) NOT NULL,
    "original_price" DECIMAL(12,2),
    "duration" INTEGER NOT NULL,
    "duration_type" "subscription_duration" NOT NULL DEFAULT 'months',
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "badge" VARCHAR(50),
    "color" VARCHAR(20) NOT NULL DEFAULT '#8B7355',
    "stripe_product_id" VARCHAR(255),
    "stripe_price_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan_benefits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" VARCHAR(20) NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "subscription_plan_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyer_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "discount_percent_snapshot" DECIMAL(5,2),
    "status" "subscription_status" NOT NULL DEFAULT 'pending',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "payment_method" VARCHAR(50),
    "transaction_id" VARCHAR(255),
    "amount" DECIMAL(12,2) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "stripe_payment_intent_id" VARCHAR(255),
    "stripe_charge_id" VARCHAR(255),
    "stripe_subscription_id" VARCHAR(255),
    "stripe_customer_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyer_id" UUID,
    "type" "notification_type" NOT NULL DEFAULT 'system',
    "audience" "notification_audience" NOT NULL DEFAULT 'individual',
    "title" VARCHAR(120) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "status" "notification_status" NOT NULL DEFAULT 'unread',
    "action_link" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "read_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_notification_reads" (
    "notification_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buyer_notification_reads_pkey" PRIMARY KEY ("notification_id","buyer_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "status" "message_status" NOT NULL DEFAULT 'unread',
    "admin_reply" TEXT,
    "replied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" VARCHAR(300) NOT NULL,
    "answer" VARCHAR(2000) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyer_id" UUID NOT NULL,
    "buyer_email" VARCHAR(255) NOT NULL,
    "buyer_name" VARCHAR(150),
    "subject" VARCHAR(140) NOT NULL,
    "category" "support_category" NOT NULL DEFAULT 'other',
    "priority" "support_priority" NOT NULL DEFAULT 'normal',
    "message" VARCHAR(2000) NOT NULL,
    "order_number" VARCHAR(20),
    "status" "support_status" NOT NULL DEFAULT 'open',
    "admin_notes" TEXT,
    "last_updated_by" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "sender" "support_sender" NOT NULL,
    "message" VARCHAR(2000) NOT NULL,
    "author_name" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_singleton_key" ON "admins"("singleton");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_settings_admin_id_key" ON "admin_settings"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "buyers_email_key" ON "buyers"("email");

-- CreateIndex
CREATE INDEX "buyer_addresses_buyer_id_idx" ON "buyer_addresses"("buyer_id");

-- CreateIndex
CREATE UNIQUE INDEX "image_assets_path_key" ON "image_assets"("path");

-- CreateIndex
CREATE INDEX "image_assets_sha256_idx" ON "image_assets"("sha256");

-- CreateIndex
CREATE INDEX "image_assets_phash_idx" ON "image_assets"("phash");

-- CreateIndex
CREATE INDEX "image_asset_usages_model_doc_id_idx" ON "image_asset_usages"("model", "doc_id");

-- CreateIndex
CREATE UNIQUE INDEX "image_asset_usages_image_id_model_doc_id_field_key" ON "image_asset_usages"("image_id", "model", "doc_id", "field");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_status_idx" ON "categories"("status");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_status_deleted_category_id_idx" ON "products"("status", "deleted", "category_id");

-- CreateIndex
CREATE INDEX "products_status_deleted_created_at_idx" ON "products"("status", "deleted", "created_at" DESC);

-- CreateIndex
CREATE INDEX "products_status_deleted_average_rating_total_reviews_idx" ON "products"("status", "deleted", "average_rating" DESC, "total_reviews" DESC);

-- CreateIndex
CREATE INDEX "products_specifications_idx" ON "products" USING GIN ("specifications");

-- CreateIndex
CREATE INDEX "product_images_product_id_sort_order_idx" ON "product_images"("product_id", "sort_order");

-- CreateIndex
CREATE INDEX "product_labels_product_id_idx" ON "product_labels"("product_id");

-- CreateIndex
CREATE INDEX "product_ingredients_product_id_idx" ON "product_ingredients"("product_id");

-- CreateIndex
CREATE INDEX "product_nutrition_facts_product_id_idx" ON "product_nutrition_facts"("product_id");

-- CreateIndex
CREATE INDEX "product_benefits_product_id_idx" ON "product_benefits"("product_id");

-- CreateIndex
CREATE INDEX "product_faqs_product_id_idx" ON "product_faqs"("product_id");

-- CreateIndex
CREATE INDEX "product_stat_highlights_product_id_idx" ON "product_stat_highlights"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripe_payment_intent_id_key" ON "orders"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_customer_email_idx" ON "orders"("customer_email");

-- CreateIndex
CREATE INDEX "orders_order_status_idx" ON "orders"("order_status");

-- CreateIndex
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "orders_order_status_payment_status_idx" ON "orders"("order_status", "payment_status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_status_idx" ON "reviews"("product_id", "status");

-- CreateIndex
CREATE INDEX "reviews_user_email_idx" ON "reviews"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_product_id_order_id_key" ON "reviews"("product_id", "order_id");

-- CreateIndex
CREATE INDEX "subscription_plans_is_active_sort_order_idx" ON "subscription_plans"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "subscription_plan_benefits_plan_id_idx" ON "subscription_plan_benefits"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripe_subscription_id_key" ON "user_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_buyer_id_idx" ON "user_subscriptions"("buyer_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions"("status");

-- CreateIndex
CREATE INDEX "user_subscriptions_stripe_customer_id_idx" ON "user_subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "buyer_notifications_buyer_id_created_at_idx" ON "buyer_notifications"("buyer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "buyer_notifications_buyer_id_status_idx" ON "buyer_notifications"("buyer_id", "status");

-- CreateIndex
CREATE INDEX "buyer_notifications_audience_created_at_idx" ON "buyer_notifications"("audience", "created_at" DESC);

-- CreateIndex
CREATE INDEX "buyer_notification_reads_buyer_id_idx" ON "buyer_notification_reads"("buyer_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_status_idx" ON "messages"("status");

-- CreateIndex
CREATE INDEX "faqs_sort_order_idx" ON "faqs"("sort_order");

-- CreateIndex
CREATE INDEX "support_tickets_buyer_id_created_at_idx" ON "support_tickets"("buyer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_ticket_messages_ticket_id_created_at_idx" ON "support_ticket_messages"("ticket_id", "created_at");

-- AddForeignKey
ALTER TABLE "admin_settings" ADD CONSTRAINT "admin_settings_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_addresses" ADD CONSTRAINT "buyer_addresses_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_asset_usages" ADD CONSTRAINT "image_asset_usages_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_labels" ADD CONSTRAINT "product_labels_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_nutrition_facts" ADD CONSTRAINT "product_nutrition_facts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_benefits" ADD CONSTRAINT "product_benefits_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_faqs" ADD CONSTRAINT "product_faqs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stat_highlights" ADD CONSTRAINT "product_stat_highlights_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plan_benefits" ADD CONSTRAINT "subscription_plan_benefits_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_notifications" ADD CONSTRAINT "buyer_notifications_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_notification_reads" ADD CONSTRAINT "buyer_notification_reads_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "buyer_notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_notification_reads" ADD CONSTRAINT "buyer_notification_reads_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
