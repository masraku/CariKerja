DROP INDEX IF EXISTS "jobs_level_idx";

ALTER TABLE "jobs" DROP COLUMN IF EXISTS "level";
