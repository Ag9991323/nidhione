/*
  Warnings:

  - You are about to drop the `lic_policies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nps_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ppf_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "lic_policies" DROP CONSTRAINT "lic_policies_goalId_fkey";

-- DropForeignKey
ALTER TABLE "lic_policies" DROP CONSTRAINT "lic_policies_userId_fkey";

-- DropForeignKey
ALTER TABLE "nps_accounts" DROP CONSTRAINT "nps_accounts_goalId_fkey";

-- DropForeignKey
ALTER TABLE "nps_accounts" DROP CONSTRAINT "nps_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "ppf_accounts" DROP CONSTRAINT "ppf_accounts_goalId_fkey";

-- DropForeignKey
ALTER TABLE "ppf_accounts" DROP CONSTRAINT "ppf_accounts_userId_fkey";

-- DropTable
DROP TABLE "lic_policies";

-- DropTable
DROP TABLE "nps_accounts";

-- DropTable
DROP TABLE "ppf_accounts";

-- CreateTable
CREATE TABLE "track_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "netWorth" DOUBLE PRECISION NOT NULL,
    "totalAssets" DOUBLE PRECISION NOT NULL,
    "totalLiabilities" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "track_records_userId_snapshotDate_key" ON "track_records"("userId", "snapshotDate");

-- AddForeignKey
ALTER TABLE "track_records" ADD CONSTRAINT "track_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
