/*
  Warnings:

  - You are about to drop the column `date` on the `daily_gold_prices` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `daily_mutual_fund_navs` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `daily_stock_prices` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[source]` on the table `daily_gold_prices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schemeCode]` on the table `daily_mutual_fund_navs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[symbol]` on the table `daily_stock_prices` will be added. If there are existing duplicate values, this will fail.

*/
-- Delete duplicate stock prices, keeping only the latest date per symbol
DELETE FROM "daily_stock_prices"
WHERE "id" IN (
  '868b545c-e2f5-4e79-b484-0031e88976da',
  '1e41ef66-39d4-450a-8d49-6d996925cead',
  '04821048-97c5-4bde-b196-3e36359e7eb7',
  '5563a762-dfbd-4b85-9058-f253adc4408f',
  'b4959c5c-f3bd-47a7-ad4a-8e9845917672'
);

-- DropIndex
DROP INDEX "daily_gold_prices_date_key";

-- DropIndex
DROP INDEX "daily_mutual_fund_navs_schemeCode_date_key";

-- DropIndex
DROP INDEX "daily_stock_prices_symbol_date_key";

-- AlterTable
ALTER TABLE "daily_gold_prices" DROP COLUMN "date";

-- AlterTable
ALTER TABLE "daily_mutual_fund_navs" DROP COLUMN "date";

-- AlterTable
ALTER TABLE "daily_stock_prices" DROP COLUMN "date";

-- AlterTable
ALTER TABLE "track_records" ADD COLUMN     "breakdown" JSONB;

-- CreateTable
CREATE TABLE "email_otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_gold_prices_source_key" ON "daily_gold_prices"("source");

-- CreateIndex
CREATE UNIQUE INDEX "daily_mutual_fund_navs_schemeCode_key" ON "daily_mutual_fund_navs"("schemeCode");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stock_prices_symbol_key" ON "daily_stock_prices"("symbol");
