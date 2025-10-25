-- Add acceptNewClients field to agenda_settings table
ALTER TABLE "agenda_settings"
ADD COLUMN IF NOT EXISTS "acceptNewClients" BOOLEAN NOT NULL DEFAULT true;
