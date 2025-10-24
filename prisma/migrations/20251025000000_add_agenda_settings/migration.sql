-- CreateTable
CREATE TABLE IF NOT EXISTS "agenda_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "availabilities" JSONB,
    "appointmentTypes" JSONB,
    "bufferMin" INTEGER NOT NULL DEFAULT 0,
    "defaultView" TEXT NOT NULL DEFAULT 'timeGridWeek',
    "allowedLocations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "agenda_settings_userId_key" ON "agenda_settings"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agenda_settings_userId_idx" ON "agenda_settings"("userId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'agenda_settings_userId_fkey'
    ) THEN
        ALTER TABLE "agenda_settings" ADD CONSTRAINT "agenda_settings_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
