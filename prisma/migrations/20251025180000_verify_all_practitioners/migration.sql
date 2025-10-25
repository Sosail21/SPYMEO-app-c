-- Verify all existing practitioner profiles for launch
-- This ensures all practitioners can receive bookings
-- TODO: Implement admin verification workflow later

UPDATE "practitioner_profiles"
SET "verified" = true
WHERE "verified" = false;
