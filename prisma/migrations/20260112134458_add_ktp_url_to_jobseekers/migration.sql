/*
  Warnings:

  - The `level` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Interview` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ContractRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContractWorkerStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ResignationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "JobScope" AS ENUM ('DOMESTIC', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'RESIGNED';

-- AlterEnum
ALTER TYPE "CompanyStatus" ADD VALUE 'PENDING_RESUBMISSION';

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_recruiterId_fkey";

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "candidateEmail" TEXT,
ADD COLUMN     "candidateName" TEXT,
ADD COLUMN     "candidatePhone" TEXT,
ADD COLUMN     "confirmedByJobseeker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "matchPercentage" TEXT,
ADD COLUMN     "matchStatus" TEXT,
ADD COLUMN     "matchedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "withdrawReason" TEXT,
ADD COLUMN     "withdrawnAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "bio" TEXT;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "disabilityDescription" TEXT,
ADD COLUMN     "gallery" TEXT[],
ADD COLUMN     "holidays" TEXT,
ADD COLUMN     "isDisabilityFriendly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShift" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobScope" "JobScope" NOT NULL DEFAULT 'DOMESTIC',
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "shiftCount" INTEGER,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "workingDays" TEXT,
DROP COLUMN "level",
ADD COLUMN     "level" TEXT;

-- AlterTable
ALTER TABLE "jobseekers" ADD COLUMN     "ak1Url" TEXT,
ADD COLUMN     "disabilityType" TEXT,
ADD COLUMN     "employedAt" TIMESTAMP(3),
ADD COLUMN     "employedCompany" TEXT,
ADD COLUMN     "graduationYear" INTEGER,
ADD COLUMN     "hasDisability" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ijazahUrl" TEXT,
ADD COLUMN     "isEmployed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLookingForJob" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "kecamatan" TEXT,
ADD COLUMN     "kelurahan" TEXT,
ADD COLUMN     "ktpUrl" TEXT,
ADD COLUMN     "lastEducationInstitution" TEXT,
ADD COLUMN     "lastEducationLevel" TEXT,
ADD COLUMN     "lastEducationMajor" TEXT,
ADD COLUMN     "sertifikatUrl" TEXT,
ADD COLUMN     "suratPengalamanUrl" TEXT;

-- AlterTable
ALTER TABLE "recruiters" ADD COLUMN     "photoUrl" TEXT;

-- DropTable
DROP TABLE "Interview";

-- DropEnum
DROP TYPE "JobLevel";

-- CreateTable
CREATE TABLE "interview_participants" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "responseMessage" TEXT,
    "feedback" TEXT,
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "jobId" TEXT,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "meetingType" TEXT NOT NULL DEFAULT 'GOOGLE_MEET',
    "meetingUrl" TEXT,
    "location" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resignations" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobseekerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "letterUrl" TEXT NOT NULL,
    "status" "ResignationStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "recruiterNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resignations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_registrations" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "ContractRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "recruiterDocUrl" TEXT,
    "notes" TEXT,
    "adminNotes" TEXT,
    "adminResponseDocUrl" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_workers" (
    "id" TEXT NOT NULL,
    "contractRegistrationId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobseekerId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "salary" BIGINT NOT NULL,
    "status" "ContractWorkerStatus" NOT NULL DEFAULT 'ACTIVE',
    "terminatedAt" TIMESTAMP(3),
    "terminationReason" TEXT,
    "terminatedBy" TEXT,
    "attachmentUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_participants_applicationId_idx" ON "interview_participants"("applicationId");

-- CreateIndex
CREATE INDEX "interview_participants_interviewId_idx" ON "interview_participants"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "interview_participants_interviewId_applicationId_key" ON "interview_participants"("interviewId", "applicationId");

-- CreateIndex
CREATE INDEX "interviews_jobId_idx" ON "interviews"("jobId");

-- CreateIndex
CREATE INDEX "interviews_recruiterId_idx" ON "interviews"("recruiterId");

-- CreateIndex
CREATE INDEX "interviews_scheduledAt_idx" ON "interviews"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "resignations_applicationId_key" ON "resignations"("applicationId");

-- CreateIndex
CREATE INDEX "resignations_applicationId_idx" ON "resignations"("applicationId");

-- CreateIndex
CREATE INDEX "resignations_jobseekerId_idx" ON "resignations"("jobseekerId");

-- CreateIndex
CREATE INDEX "resignations_status_idx" ON "resignations"("status");

-- CreateIndex
CREATE INDEX "contract_registrations_recruiterId_idx" ON "contract_registrations"("recruiterId");

-- CreateIndex
CREATE INDEX "contract_registrations_companyId_idx" ON "contract_registrations"("companyId");

-- CreateIndex
CREATE INDEX "contract_registrations_status_idx" ON "contract_registrations"("status");

-- CreateIndex
CREATE INDEX "contract_workers_contractRegistrationId_idx" ON "contract_workers"("contractRegistrationId");

-- CreateIndex
CREATE INDEX "contract_workers_applicationId_idx" ON "contract_workers"("applicationId");

-- CreateIndex
CREATE INDEX "contract_workers_jobseekerId_idx" ON "contract_workers"("jobseekerId");

-- CreateIndex
CREATE INDEX "contract_workers_status_idx" ON "contract_workers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "contract_workers_contractRegistrationId_applicationId_key" ON "contract_workers"("contractRegistrationId", "applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_slug_idx" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_status_idx" ON "news"("status");

-- CreateIndex
CREATE INDEX "news_publishedAt_idx" ON "news"("publishedAt");

-- CreateIndex
CREATE INDEX "news_category_idx" ON "news"("category");

-- CreateIndex
CREATE INDEX "idx_applications_matchStatus" ON "applications"("matchStatus");

-- CreateIndex
CREATE INDEX "jobs_level_idx" ON "jobs"("level");

-- AddForeignKey
ALTER TABLE "interview_participants" ADD CONSTRAINT "interview_participants_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_participants" ADD CONSTRAINT "interview_participants_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "recruiters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resignations" ADD CONSTRAINT "resignations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resignations" ADD CONSTRAINT "resignations_jobseekerId_fkey" FOREIGN KEY ("jobseekerId") REFERENCES "jobseekers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_registrations" ADD CONSTRAINT "contract_registrations_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "recruiters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_registrations" ADD CONSTRAINT "contract_registrations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_workers" ADD CONSTRAINT "contract_workers_contractRegistrationId_fkey" FOREIGN KEY ("contractRegistrationId") REFERENCES "contract_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_workers" ADD CONSTRAINT "contract_workers_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_workers" ADD CONSTRAINT "contract_workers_jobseekerId_fkey" FOREIGN KEY ("jobseekerId") REFERENCES "jobseekers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
