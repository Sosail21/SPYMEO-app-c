-- Auto-verify all existing practitioner profiles
-- This allows them to be visible on the public pages

UPDATE "practitioner_profiles"
SET "verified" = true
WHERE "verified" = false;
