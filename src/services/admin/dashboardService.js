import { redis } from "@/lib/redis";
import prisma from "@/utils/prisma";
import { dashboardDatakey } from "@/utils/redisKeyNames";

export const getDashboardMetrics = async () => {

    const data = await redis.get(dashboardDatakey);
    const parseData = JSON.parse(data);

    if (parseData && Object.keys(parseData).length > 0) {
        return parseData;
    }

  const [
    // User metrics
    totalUsers,
    developersCount,
    recruitersCount,
    adminsCount,
    activeUsers,
    inactiveUsers,
    unverifiedUsers,

    // Company metrics
    totalCompanies,
    verifiedCompanies,
    pendingCompanyVerification,

    // Job metrics
    totalJobs,
    activeJobs,
    closedJobs,
    expiredJobs,
    draftJobs,

    // Application metrics
    totalApplications,
    pendingApplications,
    reviewApplications,
    acceptedApplications,
    rejectedApplications,

    // Recent activity logs
    recentUsers,
    recentCompanies,
    recentJobs,
    recentApplications,
  ] = await prisma.$transaction([
    // User Queries
    prisma.user.count(),
    prisma.user.count({ where: { role: "DEVELOPER" } }),
    prisma.user.count({ where: { role: "RECRUITER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({ where: { isVerified: false } }),

    // Company Queries
    prisma.company.count(),
    prisma.company.count({ where: { isVerified: true } }),
    prisma.company.count({ where: { isVerified: false } }),

    // Job Queries
    prisma.job.count(),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.job.count({ where: { status: "CLOSED" } }),
    prisma.job.count({ where: { status: "EXPIRED" } }),
    prisma.job.count({ where: { status: "DRAFT" } }),

    // Application Queries
    prisma.application.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "REVIEW" } }),
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),

    // Recent Activity Queries
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    }),
    prisma.company.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        industry: true,
        country: true,
        isVerified: true,
        createdAt: true,
      },
    }),
    prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        employmentType: true,
        createdAt: true,
        company: { select: { id: true, name: true } },
      },
    }),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        job: { select: { id: true, title: true } },
        developerProfile: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
  ]);

  const resObject = {
    metrics: {
        users: {
          total: totalUsers,
          developers: developersCount,
          recruiters: recruitersCount,
          admins: adminsCount,
          active: activeUsers,
          inactive: inactiveUsers,
          unverified: unverifiedUsers,
        },
        companies: {
          total: totalCompanies,
          verified: verifiedCompanies,
          pendingVerification: pendingCompanyVerification,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          expired: expiredJobs,
          draft: draftJobs,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          review: reviewApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
        },
      },
      recentActivity: {
        recentUsers,
        recentCompanies,
        recentJobs,
        recentApplications,
      },
  }

  try {
    await redis.set(dashboardDatakey, JSON.stringify(resObject), "EX", 300, "NX")
  } catch (error) {
    console.log("Redis error:", error)
  }

  return resObject;
};