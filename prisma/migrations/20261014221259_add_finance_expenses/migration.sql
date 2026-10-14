-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('VEHICLE_FINANCE', 'INSURANCE', 'REPAIR', 'PARTS', 'FUEL', 'ADBLUE', 'CLEANING', 'TAXES', 'ACCOUNTING', 'MARKETING', 'SALARY', 'RENT', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PLANNED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseSource" AS ENUM ('MANUAL', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE "Expense" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PAID',
    "source" "ExpenseSource" NOT NULL DEFAULT 'MANUAL',
    "amount" INTEGER NOT NULL,
    "expenseDate" DATE NOT NULL,
    "dueDate" DATE,
    "paidDate" DATE,
    "supplier" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceFrequency" "RecurrenceFrequency",
    "nextDueDate" DATE,
    "vehicleId" UUID,
    "maintenanceEventId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Expense_maintenanceEventId_key" ON "Expense"("maintenanceEventId");

-- CreateIndex
CREATE INDEX "Expense_status_expenseDate_idx" ON "Expense"("status", "expenseDate");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_vehicleId_idx" ON "Expense"("vehicleId");

-- CreateIndex
CREATE INDEX "Expense_dueDate_idx" ON "Expense"("dueDate");

-- CreateIndex
CREATE INDEX "Expense_nextDueDate_idx" ON "Expense"("nextDueDate");

-- CreateIndex
CREATE INDEX "Expense_recurring_nextDueDate_idx" ON "Expense"("recurring", "nextDueDate");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_maintenanceEventId_fkey" FOREIGN KEY ("maintenanceEventId") REFERENCES "MaintenanceEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
