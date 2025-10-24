-- Migration: Add clientId to Appointment model
-- Date: 2025-10-24

-- Add clientId column to appointments table
ALTER TABLE appointments ADD COLUMN "clientId" TEXT;

-- Add index on clientId for performance
CREATE INDEX "appointments_clientId_idx" ON appointments("clientId");

-- Add foreign key constraint (with SET NULL on delete)
ALTER TABLE appointments ADD CONSTRAINT "appointments_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES clients(id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Update status field comment to include NO_SHOW
COMMENT ON COLUMN appointments.status IS 'Status: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW';
