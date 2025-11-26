-- Add new columns to recruiters table
ALTER TABLE recruiters 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;

-- Add gallery column to companies table  
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
