-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('OIL_CHANGE', 'BRAKE_PADS', 'ADBLUE', 'TIRES', 'TECHNICAL_INSPECTION', 'INSURANCE', 'REPAIR', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MaintenanceEvent" (
    "id" UUID NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" DATE NOT NULL,
    "endDate" DATE,
    "completedDate" DATE,
    "nextDueDate" DATE,
    "mileageAtService" INTEGER,
    "nextServiceMileage" INTEGER,
    "cost" INTEGER,
    "garage" TEXT,
    "notes" TEXT,
    "blocksAvailability" BOOLEAN NOT NULL DEFAULT true,
    "vehicleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaintenanceEvent_vehicleId_scheduledDate_idx" ON "MaintenanceEvent"("vehicleId", "scheduledDate");

-- CreateIndex
CREATE INDEX "MaintenanceEvent_status_scheduledDate_idx" ON "MaintenanceEvent"("status", "scheduledDate");

-- CreateIndex
CREATE INDEX "MaintenanceEvent_type_idx" ON "MaintenanceEvent"("type");

-- CreateIndex
CREATE INDEX "MaintenanceEvent_nextDueDate_idx" ON "MaintenanceEvent"("nextDueDate");

-- CreateIndex
CREATE INDEX "MaintenanceEvent_nextServiceMileage_idx" ON "MaintenanceEvent"("nextServiceMileage");

-- AddForeignKey
ALTER TABLE "MaintenanceEvent" ADD CONSTRAINT "MaintenanceEvent_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
