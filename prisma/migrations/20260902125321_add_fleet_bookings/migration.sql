-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "pickupDate" DATE NOT NULL,
    "returnDate" DATE NOT NULL,
    "pickupTime" TEXT,
    "returnTime" TEXT,
    "pickupLocation" TEXT NOT NULL,
    "returnLocation" TEXT,
    "dailyRate" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "depositRequired" INTEGER,
    "depositPaid" INTEGER NOT NULL DEFAULT 0,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "internalNotes" TEXT,
    "vehicleId" UUID NOT NULL,
    "reservationRequestId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reservationRequestId_key" ON "Booking"("reservationRequestId");

-- CreateIndex
CREATE INDEX "Booking_vehicleId_pickupDate_returnDate_idx" ON "Booking"("vehicleId", "pickupDate", "returnDate");

-- CreateIndex
CREATE INDEX "Booking_status_pickupDate_idx" ON "Booking"("status", "pickupDate");

-- CreateIndex
CREATE INDEX "Booking_status_returnDate_idx" ON "Booking"("status", "returnDate");

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");

-- CreateIndex
CREATE INDEX "Booking_phone_idx" ON "Booking"("phone");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_reservationRequestId_fkey" FOREIGN KEY ("reservationRequestId") REFERENCES "ReservationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
