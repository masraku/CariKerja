-- Check Data Integrity
-- Run these in Prisma Studio or psql

-- 1. Check Users without JobSeeker profile
SELECT u.id, u.email, u.role, u."createdAt"
FROM users u
LEFT JOIN job_seekers js ON js."userId" = u.id
WHERE u.role = 'JOBSEEKER' AND js.id IS NULL;

-- 2. Check Users without Recruiter profile  
SELECT u.id, u.email, u.role, u."createdAt"
FROM users u
LEFT JOIN recruiters r ON r."userId" = u.id
WHERE u.role = 'RECRUITER' AND r.id IS NULL;

-- 3. Check Applications with invalid jobseekerId
SELECT a.id, a."jobseekerId", a.status, j.title
FROM applications a
LEFT JOIN job_seekers js ON js.id = a."jobseekerId"
LEFT JOIN jobs j ON j.id = a."jobId"
WHERE js.id IS NULL;

-- 4. Count orphaned interviews
SELECT COUNT(*)
FROM interviews i
LEFT JOIN recruiters r ON r.id = i."recruiterId"
WHERE r.id IS NULL;

-- ========================================
-- FIX SCRIPTS (use with caution!)
-- ========================================

-- FIX 1: Create missing JobSeeker profiles
-- WARNING: This will create empty profiles for all jobseeker users
INSERT INTO job_seekers ("userId", "firstName", "lastName", "profileCompleted", "profileCompleteness", "createdAt", "updatedAt")
SELECT 
  u.id,
  '',
  '',
  false,
  0,
  NOW(),
  NOW()
FROM users u
LEFT JOIN job_seekers js ON js."userId" = u.id
WHERE u.role = 'JOBSEEKER' AND js.id IS NULL
ON CONFLICT ("userId") DO NOTHING;

-- FIX 2: Create missing Recruiter profiles
-- WARNING: This requires companyId which we don't have
-- Manual fix needed - assign to existing company or create one

-- FIX 3: Check for duplicate JobSeeker records
SELECT "userId", COUNT(*) as count
FROM job_seekers
GROUP BY "userId"
HAVING COUNT(*) > 1;

-- FIX 4: If duplicates found, keep the oldest and delete others
-- BE CAREFUL: This will delete data!
-- Run this ONLY if you have duplicates and no critical data in newer records
DELETE FROM job_seekers
WHERE id NOT IN (
  SELECT MIN(id)
  FROM job_seekers
  GROUP BY "userId"
);
