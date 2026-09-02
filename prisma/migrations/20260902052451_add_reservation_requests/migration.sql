-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "seats" SET DEFAULT 5;

-- CreateTable
CREATE TABLE "ReservationRequest" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'NEW',
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "deliveryLocation" TEXT NOT NULL,
    "pickupDate" DATE NOT NULL,
    "returnDate" DATE NOT NULL,
    "advertisedDailyRate" INTEGER NOT NULL,
    "customerMessage" TEXT,
    "internalNotes" TEXT,
    "vehicleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservationRequest_reference_key" ON "ReservationRequest"("reference");

-- CreateIndex
CREATE INDEX "ReservationRequest_status_createdAt_idx" ON "ReservationRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ReservationRequest_vehicleId_idx" ON "ReservationRequest"("vehicleId");

-- CreateIndex
CREATE INDEX "ReservationRequest_pickupDate_returnDate_idx" ON "ReservationRequest"("pickupDate", "returnDate");

-- CreateIndex
CREATE INDEX "ReservationRequest_phone_idx" ON "ReservationRequest"("phone");

-- AddForeignKey
ALTER TABLE "ReservationRequest" ADD CONSTRAINT "ReservationRequest_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
