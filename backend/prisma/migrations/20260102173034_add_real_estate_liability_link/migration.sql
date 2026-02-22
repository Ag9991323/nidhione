-- AlterTable
ALTER TABLE "real_estate" ADD COLUMN     "liabilityId" TEXT;

-- AddForeignKey
ALTER TABLE "real_estate" ADD CONSTRAINT "real_estate_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "liabilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
