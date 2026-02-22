-- CreateTable
CREATE TABLE "daily_mutual_fund_navs" (
    "id" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'api',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_mutual_fund_navs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_mutual_fund_navs_schemeCode_date_key" ON "daily_mutual_fund_navs"("schemeCode", "date");
