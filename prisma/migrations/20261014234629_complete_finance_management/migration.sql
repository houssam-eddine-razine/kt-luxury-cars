/*
  Warnings:

  - A unique constraint covering the columns `[recurrenceSeriesId,expenseDate]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ExpenseSource" ADD VALUE 'CORRECTION';

-- AlterEnum
ALTER TYPE "ExpenseStatus" ADD VALUE 'CORRECTED';

-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'DECLINED';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "correctionOfId" UUID,
ADD COLUMN     "recurrenceSeriesId" UUID;

-- AlterTable
ALTER TABLE "ReservationRequest" ALTER COLUMN "locale" SET DEFAULT 'fr';

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "seats" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Expense_recurrenceSeriesId_idx" ON "Expense"("recurrenceSeriesId");

-- CreateIndex
CREATE INDEX "Expense_correctionOfId_idx" ON "Expense"("correctionOfId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_recurrenceSeriesId_expenseDate_key" ON "Expense"("recurrenceSeriesId", "expenseDate");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_correctionOfId_fkey" FOREIGN KEY ("correctionOfId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
