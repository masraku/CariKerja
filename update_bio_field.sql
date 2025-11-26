-- Move bio field from recruiters to companies table
-- and remove photoUrl field

-- 1. Add bio column to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Remove bio column from recruiters table (if exists)  
ALTER TABLE recruiters
DROP COLUMN IF EXISTS bio;

-- 3. Ensure photoUrl exists in recruiters table
ALTER TABLE recruiters
ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
