-- CreateEnum
CREATE TYPE "CustomerProfileStatus" AS ENUM ('NORMAL', 'TRUSTED', 'WATCHLIST', 'BLOCKED');

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" UUID NOT NULL,
    "phoneKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "status" "CustomerProfileStatus" NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_phoneKey_key" ON "CustomerProfile"("phoneKey");

-- CreateIndex
CREATE INDEX "CustomerProfile_status_idx" ON "CustomerProfile"("status");

-- CreateIndex
CREATE INDEX "CustomerProfile_displayName_idx" ON "CustomerProfile"("displayName");

-- CreateIndex
CREATE INDEX "CustomerProfile_phone_idx" ON "CustomerProfile"("phone");

-- CreateIndex
CREATE INDEX "CustomerProfile_email_idx" ON "CustomerProfile"("email");
