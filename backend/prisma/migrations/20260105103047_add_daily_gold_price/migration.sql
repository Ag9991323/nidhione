-- CreateTable
CREATE TABLE "daily_gold_prices" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "price24K" DOUBLE PRECISION NOT NULL,
    "price22K" DOUBLE PRECISION NOT NULL,
    "price18K" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'api',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_gold_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_gold_prices_date_key" ON "daily_gold_prices"("date");
