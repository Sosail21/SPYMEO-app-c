-- Add consultation type fields to appointments
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "consultationType" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "duration" INTEGER;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION;

-- Add cancellation tracking fields
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
