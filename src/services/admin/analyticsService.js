import prisma from "@/utils/prisma";
import { ROLE, STATUS } from "@/generated/prisma";

const buildDateFilter = (from, to) => {
  const filter = {};
  if (from) filter.gte = new Date(from);
  if (to) filter.lte = new Date(to);
  return filter;
};

/**
 * 1. User Domain Analytics
 */ 
export const getUserAnalytics = async ({ from, to }) => {
  const dateFilter = buildDateFilter(from, to);
  const whereCreatedAt = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [
    totalUsers,
    developerCount,
    recruiterCount,
    activeUsers,
    inactiveUsers,
    verifiedUsers,
    unverifiedUsers,
    newUsersOverTime,
  ] = await prisma.$transaction([
    prisma.user.count({ where: whereCreatedAt }),
    prisma.user.count({ where: { role: ROLE.DEVELOPER, ...whereCreatedAt } }),
    prisma.user.count({ where: { role: ROLE.RECRUITER, ...whereCreatedAt } }),
    prisma.user.count({ where: { isActive: true, ...whereCreatedAt } }),
    prisma.user.count({ where: { isActive: false, ...whereCreatedAt } }),
    prisma.user.count({ where: { isVerified: true, ...whereCreatedAt } }),
    prisma.user.count({ where: { isVerified: false, ...whereCreatedAt } }),
    prisma.user.groupBy({
      by: ["createdAt"],
      where: whereCreatedAt,
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return {
    overview: {
      totalUsers,
      developerCount,
      recruiterCount,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers,
    },
    newUsersOverTime,
  };
};

/**
 * 2. Job Domain Analytics
 */
export const getJobAnalytics = async ({ from, to }) => {
  const dateFilter = buildDateFilter(from, to);
  const whereCreatedAt = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [
    totalJobs,
    activeJobs,
    closedJobs,
    expiredJobs,
    jobsByType,
    jobsByExperience,
    jobsByLocation,
    jobsOverTime,
    jobsForIndustry,
  ] = await prisma.$transaction([
    prisma.job.count({ where: whereCreatedAt }),
    prisma.job.count({ where: { status: "ACTIVE", ...whereCreatedAt } }),
    prisma.job.count({ where: { status: "CLOSED", ...whereCreatedAt } }),
    prisma.job.count({ where: { status: "EXPIRED", ...whereCreatedAt } }),
    prisma.job.groupBy({ by: ["employmentType"], where: whereCreatedAt, _count: { id: true } }),
    prisma.job.groupBy({ by: ["experienceLevel"], where: whereCreatedAt, _count: { id: true } }),
    prisma.job.groupBy({ by: ["locationPreference"], where: whereCreatedAt, _count: { id: true } }),
    prisma.job.groupBy({
      by: ["createdAt"],
      where: whereCreatedAt,
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.job.findMany({
      where: whereCreatedAt,
      select: { company: { select: { industry: true } } },
    }),
  ]);

  // Industry belongs to Company, not Job, so derive this breakdown through
  // each job's company relation instead of asking Prisma to group by a
  // nonexistent Job.industry field.
  const industryCounts = jobsForIndustry.reduce((counts, job) => {
    const industry = job.company.industry;
    counts[industry] = (counts[industry] || 0) + 1;
    return counts;
  }, {});
  const jobsByIndustry = Object.entries(industryCounts).map(
    ([industry, count]) => ({ industry, _count: { id: count } })
  );

  return {
    overview: {
      totalJobs,
      activeJobs,
      closedJobs,
      expiredJobs,
    },
    breakdown: {
      jobsByType,
      jobsByExperience,
      jobsByLocation,
      jobsByIndustry,
    },
    jobsOverTime,
  };
};

/**
 * 3. Application Domain Analytics
 */
export const getApplicationAnalytics = async ({ from, to }) => {
  const dateFilter = buildDateFilter(from, to);
  const whereCreatedAt = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [
    totalApplications,
    pending,
    review,
    accepted,
    rejected,
    applicationsOverTime,
    applicationsPerJob,
  ] = await prisma.$transaction([
    prisma.application.count({ where: whereCreatedAt }),
    prisma.application.count({ where: { status: STATUS.PENDING, ...whereCreatedAt } }),
    prisma.application.count({ where: { status: STATUS.REVIEW, ...whereCreatedAt } }),
    prisma.application.count({ where: { status: STATUS.ACCEPTED, ...whereCreatedAt } }),
    prisma.application.count({ where: { status: STATUS.REJECTED, ...whereCreatedAt } }),
    prisma.application.groupBy({
      by: ["createdAt"],
      where: whereCreatedAt,
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.application.groupBy({
      by: ["jobId"],
      where: whereCreatedAt,
      _count: { id: true },
    }),
  ]);

  const acceptanceRate = totalApplications > 0 ? Number(((accepted / totalApplications) * 100).toFixed(2)) : 0;
  const rejectionRate = totalApplications > 0 ? Number(((rejected / totalApplications) * 100).toFixed(2)) : 0;

  return {
    overview: {
      totalApplications,
      pending,
      review,
      accepted,
      rejected,
      acceptanceRate,
      rejectionRate,
    },
    applicationsOverTime,
    applicationsPerJob,
  };
};

/**
 * 4. Company Domain Analytics
 */
export const getCompanyAnalytics = async ({ from, to }) => {
  const dateFilter = buildDateFilter(from, to);
  const whereCreatedAt = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [
    totalCompanies,
    verified,
    unverified,
    companiesByIndustry,
    companiesByCountry,
    companyGrowth,
  ] = await prisma.$transaction([
    prisma.company.count({ where: whereCreatedAt }),
    prisma.company.count({ where: { isVerified: true, ...whereCreatedAt } }),
    prisma.company.count({ where: { isVerified: false, ...whereCreatedAt } }),
    prisma.company.groupBy({ by: ["industry"], where: whereCreatedAt, _count: { id: true } }),
    prisma.company.groupBy({ by: ["country"], where: whereCreatedAt, _count: { id: true } }),
    prisma.company.groupBy({
      by: ["createdAt"],
      where: whereCreatedAt,
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return {
    overview: {
      totalCompanies,
      verified,
      unverified,
    },
    breakdown: {
      companiesByIndustry,
      companiesByCountry,
    },
    companyGrowth,
  };
};
