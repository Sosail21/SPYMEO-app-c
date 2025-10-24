-- AlterTable appointments add clientId if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'clientId'
    ) THEN
        ALTER TABLE "appointments" ADD COLUMN "clientId" TEXT;
    END IF;
END $$;

-- CreateIndex for appointments clientId (only if column exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'appointments_clientId_idx'
    ) THEN
        CREATE INDEX "appointments_clientId_idx" ON "appointments"("clientId");
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'appointments_clientId_fkey'
    ) THEN
        ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey"
        FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
