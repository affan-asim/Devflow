/*
  Warnings:

  - The values [REJECT] on the enum `STATUS` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[jobId,devProfileId]` on the table `Applications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationPreference` to the `Jobs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'EXPIRED');

-- AlterEnum
BEGIN;
CREATE TYPE "STATUS_new" AS ENUM ('PENDING', 'REVIEW', 'ACCEPTED', 'REJECTED');
ALTER TABLE "public"."Applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Applications" ALTER COLUMN "status" TYPE "STATUS_new" USING ("status"::text::"STATUS_new");
ALTER TYPE "STATUS" RENAME TO "STATUS_old";
ALTER TYPE "STATUS_new" RENAME TO "STATUS";
DROP TYPE "public"."STATUS_old";
ALTER TABLE "Applications" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "RecruiterProfile" DROP CONSTRAINT "RecruiterProfile_companyId_fkey";

-- AlterTable
ALTER TABLE "Applications" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Jobs" ADD COLUMN     "locationPreference" "LOCATION" NOT NULL,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "RecruiterProfile" ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "refreshToken" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Applications_jobId_idx" ON "Applications"("jobId");

-- CreateIndex
CREATE INDEX "Applications_devProfileId_idx" ON "Applications"("devProfileId");

-- CreateIndex
CREATE INDEX "Applications_status_idx" ON "Applications"("status");

-- CreateIndex
CREATE INDEX "Applications_jobId_status_idx" ON "Applications"("jobId", "status");

-- CreateIndex
CREATE INDEX "Applications_devProfileId_status_idx" ON "Applications"("devProfileId", "status");

-- CreateIndex
CREATE INDEX "Applications_createdAt_idx" ON "Applications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Applications_jobId_devProfileId_key" ON "Applications"("jobId", "devProfileId");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "Company_country_idx" ON "Company"("country");

-- CreateIndex
CREATE INDEX "Company_isVerified_idx" ON "Company"("isVerified");

-- CreateIndex
CREATE INDEX "Company_isVerified_industry_country_idx" ON "Company"("isVerified", "industry", "country");

-- CreateIndex
CREATE INDEX "DeveloperProfile_locationPreference_idx" ON "DeveloperProfile"("locationPreference");

-- CreateIndex
CREATE INDEX "EmploymentHistory_devProfileId_idx" ON "EmploymentHistory"("devProfileId");

-- CreateIndex
CREATE INDEX "EmploymentHistory_companyId_idx" ON "EmploymentHistory"("companyId");

-- CreateIndex
CREATE INDEX "EmploymentHistory_devProfileId_isCurrent_idx" ON "EmploymentHistory"("devProfileId", "isCurrent");

-- CreateIndex
CREATE INDEX "Jobs_status_createdAt_idx" ON "Jobs"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Jobs_recruiterId_idx" ON "Jobs"("recruiterId");

-- CreateIndex
CREATE INDEX "Jobs_companyId_idx" ON "Jobs"("companyId");

-- CreateIndex
CREATE INDEX "Jobs_locationPreference_idx" ON "Jobs"("locationPreference");

-- CreateIndex
CREATE INDEX "Jobs_employmentType_idx" ON "Jobs"("employmentType");

-- CreateIndex
CREATE INDEX "Jobs_experienceLevel_idx" ON "Jobs"("experienceLevel");

-- CreateIndex
CREATE INDEX "Jobs_deadline_idx" ON "Jobs"("deadline");

-- CreateIndex
CREATE INDEX "Jobs_status_locationPreference_experienceLevel_idx" ON "Jobs"("status", "locationPreference", "experienceLevel");

-- CreateIndex
CREATE INDEX "Jobs_status_employmentType_experienceLevel_idx" ON "Jobs"("status", "employmentType", "experienceLevel");

-- CreateIndex
CREATE INDEX "Jobs_companyId_status_idx" ON "Jobs"("companyId", "status");

-- CreateIndex
CREATE INDEX "Notifications_recipientId_createdAt_idx" ON "Notifications"("recipientId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notifications_recipientId_isRead_idx" ON "Notifications"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notifications_actionType_idx" ON "Notifications"("actionType");

-- CreateIndex
CREATE INDEX "Notifications_referenceId_idx" ON "Notifications"("referenceId");

-- CreateIndex
CREATE INDEX "RecruiterHistory_recruiterProfileId_idx" ON "RecruiterHistory"("recruiterProfileId");

-- CreateIndex
CREATE INDEX "RecruiterHistory_companyId_idx" ON "RecruiterHistory"("companyId");

-- CreateIndex
CREATE INDEX "RecruiterHistory_recruiterProfileId_isCurrent_idx" ON "RecruiterHistory"("recruiterProfileId", "isCurrent");

-- CreateIndex
CREATE INDEX "RecruiterProfile_companyId_idx" ON "RecruiterProfile"("companyId");

-- CreateIndex
CREATE INDEX "RecruiterProfile_locationPreference_idx" ON "RecruiterProfile"("locationPreference");

-- CreateIndex
CREATE INDEX "Skills_category_idx" ON "Skills"("category");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "User_isVerified_isActive_idx" ON "User"("isVerified", "isActive");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- AddForeignKey
ALTER TABLE "RecruiterProfile" ADD CONSTRAINT "RecruiterProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
