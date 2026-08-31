-- CreateEnum
CREATE TYPE "FuelPolicy" AS ENUM ('FULL_TO_FULL', 'SAME_TO_SAME', 'PREPURCHASE');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "rentalPolicyId" UUID;

-- CreateTable
CREATE TABLE "RentalPolicy" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "minimumDriverAge" INTEGER,
    "minimumLicenseYears" INTEGER,
    "dailyMileageLimit" INTEGER,
    "extraKilometrePrice" INTEGER,
    "fuelPolicy" "FuelPolicy",
    "insuranceIncluded" BOOLEAN,
    "insuranceDetails" TEXT,
    "insuranceExcess" INTEGER,
    "airportDeliveryFee" INTEGER,
    "cancellationPolicy" TEXT,
    "acceptedPayments" TEXT,
    "requiredDocuments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentalPolicy_isDefault_active_idx" ON "RentalPolicy"("isDefault", "active");

-- CreateIndex
CREATE INDEX "Vehicle_rentalPolicyId_idx" ON "Vehicle"("rentalPolicyId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_rentalPolicyId_fkey" FOREIGN KEY ("rentalPolicyId") REFERENCES "RentalPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
