/*
  Warnings:

  - Added the required column `investedAmount` to the `gold` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gold" ADD COLUMN     "averageNav" DOUBLE PRECISION,
ADD COLUMN     "currentNav" DOUBLE PRECISION,
ADD COLUMN     "investedAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "makingCharges" DOUBLE PRECISION,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "purity" TEXT,
ADD COLUMN     "returns" DOUBLE PRECISION,
ADD COLUMN     "returnsPercentage" DOUBLE PRECISION,
ADD COLUMN     "schemeCode" TEXT,
ADD COLUMN     "schemeName" TEXT,
ADD COLUMN     "storageLocation" TEXT,
ADD COLUMN     "units" DOUBLE PRECISION,
ALTER COLUMN "quantityGrams" DROP NOT NULL,
ALTER COLUMN "averagePricePerGram" DROP NOT NULL;
