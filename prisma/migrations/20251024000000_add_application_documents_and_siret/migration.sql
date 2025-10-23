-- CreateMigration: Add applicationDocuments and siret fields to users table

-- Add siret column for business registration number
ALTER TABLE "users" ADD COLUMN "siret" TEXT;

-- Add applicationDocuments column for storing uploaded documents URLs
ALTER TABLE "users" ADD COLUMN "applicationDocuments" JSONB;

-- Add comment for documentation
COMMENT ON COLUMN "users"."siret" IS 'Business registration number (SIRET)';
COMMENT ON COLUMN "users"."applicationDocuments" IS 'JSON object containing URLs of uploaded documents: {diploma, insurance, kbis, criminalRecord}';
