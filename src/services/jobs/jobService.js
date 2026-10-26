
import { AppError } from "@/utils/AppError";
import { ActionType } from "@/generated/prisma/client";
import { ReferenceType } from "@/generated/prisma/client";
import { cacheInvalidate, getCacheKey } from "@/utils/helper";
import Redis from "ioredis";
import { jobDetail, jobList } from "@/utils/redisKeyNames";
import { getExistingSkillConnections } from "@/services/skills/skills";
import { notificationQueue } from "@/lib/queues/notification.queue";
import { PrismaClient } from "@/generated/prisma/client";
import { ROLE } from "@/generated/prisma/client";
import { getRecuiterProfile } from "../profile/recuiterService";

import prisma from "@/utils/prisma";
import { redis } from "@/lib/redis";

const ADMIN_JOB_LIST_CACHE_PREFIX = "admin:jobs:list";

const ADMIN_JOB_SORTS = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  title_asc: { title: "asc" },
  title_desc: { title: "desc" },
  salary_high: { maxSalary: "desc" },
  salary_low: { minSalary: "asc" },
  deadline: { deadline: "asc" },
};

const parseBooleanParam = (value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;

  throw new AppError("isFeatured must be true or false", 400);
};

const parsePositiveInteger = (value, fallback, max) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
};

const invalidateAdminJobCaches = async (jobId) => {
  try {
    const keys = await redis.keys(`${ADMIN_JOB_LIST_CACHE_PREFIX}:*`);

    if (keys.length) {
      await redis.del(...keys);
    }

    if (jobId) {
      await redis.del(
        `${jobDetail}:${jobId}`,
        `admin:${jobDetail}:${jobId}`
      );
    }
  } catch (error) {
    // Cache failures should not reverse a successful database mutation.
    console.error("Admin job cache invalidation failed:", error);
  }
};

const validateRecruiterCompany = async (userId, data) => {

  const { minSalary, maxSalary, deadline } = data;

  const profile = await prisma.recruiterProfile.findUnique({
    where: {
      userId
    }
  });

  if (!profile) {
    throw new AppError("Create your recuiter profile first!", 400)
  }

  const company = await prisma.company.findUnique({
    where: {
      id: profile.companyId
    }
  })

  if (!company) {
    throw new AppError("Cannot create or update other company jobs", 403)
  }

  if (!company.isVerified) {
    throw new AppError("Job is not be created until the company is verified!", 403)
  }

  if (minSalary && maxSalary && minSalary >= maxSalary) {
    throw new AppError("Min salary cannot be greater than or equal to max salary", 400)
  }

  if (deadline && deadline <= new Date()) {
    throw new AppError("Deadline cannot be less than or equal to current date", 400)
  }

  return profile;
}

export const createJob = async (userId, data) => {
  const { title, description, employmentType, experienceLevel, locationPreference, status, currency, minSalary, maxSalary, deadline, skills } = data;

  const profile = await validateRecruiterCompany(userId, data)

  const skillsConnection = await getExistingSkillConnections(skills);

  const job = await prisma.job.create({
    data: {
      companyId: profile.companyId,
      recruiterId: profile.id,
      title,
      description,
      deadline,
      experienceLevel,
      locationPreference,
      maxSalary,
      minSalary,
      currency,
      employmentType,
      status,
      skills: {
        connect: skillsConnection
      }
    },
    include: {
      company: {
        include: {
          owner: true
        }
      },
      recruiter: true,
      skills: true
    }
  });

  await cacheInvalidate(jobList);
  await cacheInvalidate(`${jobList}:recruiter-dashboard`)
  const id = crypto.randomUUID();

  try {
    await notificationQueue.add("terminated-submitted", {
      id,
      message: "Job created!",
      recipientId: job.company.owner.userId,
      referenceId: job.id,
      actionType: ActionType.JOB_CREATED,
      referenceType: ReferenceType.JOB
    }, {
      jobId: id
    })

  } catch (error) {
    console.log("Bullmq error:", error)
  }

  return job;
};

export const getJobs = async (searchParams, searchParamsObject, userId, role, includeExpired = false) => {
  const location = searchParams.get("locationPreference");
  const experience = searchParams.get("experienceLevel");
  const employmentType = searchParams.get("employmentType");
  const status = searchParams.get("status");
  const isFeatured = searchParams.get("isFeatured");
  const companyId = searchParams.get("companyId");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort");

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("limit") || 10);

  const currentPage = Math.max(1, page);
  const limit = Math.max(1, pageSize);

  const now = new Date();
  const where = includeExpired ? {} : {
    deadline: { gt: now },
  };

  if (role === "RECRUITER") {
    const profile = await getRecuiterProfile(userId);
    if (!profile) {
      throw new AppError("Create profile first", 404)
    }
    if (profile?.companyId) {
      where.companyId = profile?.companyId
    }
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: search,
          mode: 'insensitive'
        }
      }
    ]

  };

  if (isFeatured) {
    where.isFeatured = isFeatured
  }

  if (companyId) {
    where.companyId = companyId
  }

  if (location) {
    where.locationPreference = location
  }

  if (experience) {
    where.experienceLevel = experience
  }

  if (employmentType) {
    where.employmentType = employmentType
  }

  if (status) {
    where.status = status
  }

  let orderBy = {
    createdAt: "desc"
  }

  if (sort) {
    if (sort === "newest") {
      orderBy = {
        createdAt: "desc"
      }
    }

    if (sort === "salary") {
      orderBy = {
        maxSalary: "desc"
      }
    }

    if (sort === "deadline") {
      orderBy = {
        deadline: "asc"
      }
    }
  }

  const cacheKey = await getCacheKey(
    includeExpired ? `${jobList}:recruiter-dashboard` : jobList,
    searchParamsObject
  );
  let cachedData = null;

  console.log(cacheKey)

  try {
    const rawData = await redis.get(cacheKey);
    cachedData = rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error("Redis parsing failed, falling back to DB:", error);
  }

  if (
    cachedData &&
    cachedData.jobs &&
    cachedData.metadata &&
    (includeExpired || cachedData.jobs.every((job) => new Date(job.deadline) > now))
  ) {
    return {
      jobs: cachedData.jobs,
      metadata: cachedData.metadata
    };
  }

  let profileId;

  if (userId && role === ROLE.DEVELOPER) {
    profileId = await prisma.developerProfile.findUnique({
      where: {
        userId
      },
      select: {
        id: true
      }
    })

    profileId = profileId?.id;
  }

  const [jobs, totalCount] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            country: true,
            industry: true,
            logo: true,
            isVerified: true
          }
        },
        ...(profileId && {
          savedBy: {
            where: {
              devProfileId: profileId
            }
          }
        }),
        _count: {
          select: {
            applications: true
          }
        }
      },
      take: limit,
      skip: (currentPage - 1) * limit,
      orderBy
    }),
    prisma.job.count({
      where
    })
  ])

  const totalPages = Math.ceil(totalCount / limit);

  const metadata = {
    currentPage,
    pageSize: limit,
    totalCount,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }

  const responseData = { jobs, metadata };

  try {
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300, 'NX');

  } catch (error) {
    console.error("Failed to save to Redis cache:", error);
  }

  return responseData;
}

export const updateJob = async (id, data, userId) => {
  const { title, description, employmentType, experienceLevel, locationPreference, currency, minSalary, maxSalary, deadline, skills } = data;

  const profile = await validateRecruiterCompany(userId, data);

  const existingJob = await prisma.job.findUnique({
    where: {
      id
    }
  })

  if (!existingJob) {
    throw new AppError("Job is not existed!", 404)
  }

  if (existingJob.companyId !== profile.companyId) {
    throw new AppError("Connot update other company jobs!", 400)
  }

  let updatedSkillsConnection = {};

  if (skills && Array.isArray(skills)) {
    const formattedSkills = await getExistingSkillConnections(skills);

    updatedSkillsConnection = {
      set: [],
      connect: formattedSkills
    }
  };

  const job = await prisma.job.update({
    where: {
      id: existingJob.id
    },
    data: {
      title,
      description,
      deadline,
      experienceLevel,
      locationPreference,
      maxSalary,
      minSalary,
      currency,
      employmentType,
      ...(skills && { skills: updatedSkillsConnection })
    },
    include: {
      company: true,
      recruiter: true,
      skills: true
    }
  });

  await redis.del(`${jobDetail}:${job.id}`);
  await cacheInvalidate(jobList)
  await cacheInvalidate(`${jobList}:recruiter-dashboard`)

  return job;
};

export const expirePastDeadlineJobs = async () => {
  const result = await prisma.job.updateMany({
    where: {
      deadline: { lte: new Date() },
      status: { not: "EXPIRED" },
    },
    data: { status: "EXPIRED" },
  });

  if (result.count > 0) {
    await Promise.all([
      cacheInvalidate(jobList),
      cacheInvalidate(`${jobList}:recruiter-dashboard`),
    ]);
  }

  return result.count;
};

export const getJob = async (id, role, userId) => {
  const isAdmin = role === ROLE.ADMIN;
  const isDeveloper = role === ROLE.DEVELOPER;

  let developerProfileId = null;
  let recruiterProfile = null;

  // Resolve developer profile for the current user's save/application state.
  if (isDeveloper && userId) {
    const developerProfile = await prisma.developerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    developerProfileId = developerProfile?.id ?? null;
  }

  // Recruiters may only view jobs belonging to their company.
  if (role === ROLE.RECRUITER) {
    recruiterProfile = await getRecuiterProfile(userId);

    if (!recruiterProfile) {
      throw new AppError("Create profile first", 404);
    }
  }

  // Use a new key to avoid reading old cached responses that contain
  // another developer's savedJobs/applications.
  const jobKey = `${jobDetail}:v2:${id}`;

  let job = null;

  // Only use shared cache for public/developer job data.
  // Recruiter access is checked against the database below.
  if (!isAdmin && role !== ROLE.RECRUITER) {
    try {
      const cached = await redis.get(jobKey);
      job = cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Job cache read failed:", error);
    }
  }

  if (!job) {
    job = await prisma.job.findFirst({
      where: {
        id,
        ...(recruiterProfile?.companyId && {
          companyId: recruiterProfile.companyId,
        }),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            websiteUrl: true,
            industry: true,
            country: true,
            isVerified: true,
            createdAt: true,
          },
        },

        recruiter: {
          select: {
            id: true,
            userId: true,
            bio: true,
            jobTitle: true,
            description: true,
            githubUrl: true,
            portfolioUrl: true,
            locationPreference: true,
            yearsOfExp: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },

        skills: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (!isAdmin && role !== ROLE.RECRUITER) {
      try {
        await redis.set(jobKey, JSON.stringify(job), "EX", 300);
      } catch (error) {
        console.error("Job cache write failed:", error);
      }
    }
  }

  // Return developer-specific state separately from shared cached data.
  let savedBy = [];
  let applications = [];

  if (isDeveloper && developerProfileId) {
    const [savedJob, application] = await Promise.all([
      prisma.savedJob.findUnique({
        where: {
          devProfileId_jobId: {
            devProfileId: developerProfileId,
            jobId: id,
          },
        },
        select: {
          id: true,
          jobId: true,
          devProfileId: true,
          createdAt: true,
        },
      }),

      prisma.application.findUnique({
        where: {
          jobId_devProfileId: {
            jobId: id,
            devProfileId: developerProfileId,
          },
        },
        select: {
          id: true,
          jobId: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    savedBy = savedJob ? [savedJob] : [];
    applications = application ? [application] : [];
  }

  let applicationStats = null;

  if (isAdmin) {
    const countsByStatus = await prisma.application.groupBy({
      by: ["status"],
      where: { jobId: id },
      _count: { _all: true },
    });

    const breakdown = {
      PENDING: 0,
      REVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0,
    };

    for (const item of countsByStatus) {
      breakdown[item.status] = item._count._all;
    }

    applicationStats = {
      total: countsByStatus.reduce(
        (total, item) => total + item._count._all,
        0
      ),
      breakdown,
    };
  }

  return {
    ...job,

    // Explicit booleans are convenient for the frontend.
    isSaved: savedBy.length > 0,
    hasApplied: applications.length > 0,

    // Preserve the existing response fields for compatibility.
    ...(isDeveloper && {
      savedBy,
      applications,
    }),

    ...(isAdmin && { applicationStats }),
  };
};

export const deleteJob = async (id, userId, isAdmin) => {

  const profile = await prisma.recruiterProfile.findUnique({
    where: {
      userId
    }
  })

  if (!profile) {
    throw new AppError("Create your recuiter profile first!", 400)
  }

  const existingJob = await prisma.job.findUnique({
    where: {
      id
    }
  })

  if (!existingJob) {
    throw new AppError("Job is not existed!", 404)
  }

  if (profile.companyId !== existingJob.companyId) {
    throw new AppError("Connot delete other company job!", 400)
  }

  const applications = await prisma.application.findMany({
    where: {
      jobId: id,
    },
  });

  if (applications.length > 0) {
    throw new AppError("Job has applicants, Cannot delete this job!", 400);
  } 

  const job = await prisma.job.delete({
    where: {
      id
    }
  });

  await cacheInvalidate(jobList)
  await cacheInvalidate(`${jobList}:recruiter-dashboard`)
  await redis.del(`${jobDetail}:${job.id}`);

  return job;
}

export const updateJobStatus = async (id, data, userId) => {
  const { status } = data;

  const profile = await validateRecruiterCompany(userId, data)

  const existingJob = await prisma.job.findUnique({
    where: {
      id
    }
  })

  if (!existingJob) {
    throw new AppError("Job is not existed!", 404)
  }

  if (profile.companyId !== existingJob.companyId) {
    throw new AppError("Connot update other company job!", 403)
  }

  if (existingJob.status === "DRAFT") {
    if (status !== "ACTIVE") {
      throw new AppError("Job status is draft and can only be updated to active!", 403)
    }
  }

  if (existingJob.status === "ACTIVE") {
    if (status !== "CLOSED" && status !== "EXPIRED") {
      throw new AppError("Job status is ACTIVE and can only be updated to either CLOSED or EXPIRED!", 403)
    }
  }

  if (existingJob.status === "CLOSED") {
    if (status === "ACTIVE") {
      throw new AppError(`Job status is ${existingJob.status} and cannot be updated to ${status} and only be updated to active!`, 403)
    }
  }

  const job = await prisma.job.update({
    where: {
      id
    },
    data: {
      status
    }
  });

  await redis.del(`${jobDetail}:${job.id}`);
  await cacheInvalidate(jobList)
  await cacheInvalidate(`${jobList}:recruiter-dashboard`)

  return job;
}

export const updateJobFeaturedStatus = async (jobId, isFeatured) => {
  if (typeof isFeatured !== "boolean") {
    throw new AppError("isFeatured must be a boolean", 400);
  }

  const existingJob = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true },
  });

  if (!existingJob) throw new AppError("Job not found", 404);

  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: { isFeatured },
  });

  await cacheInvalidate(jobList)
  await cacheInvalidate(`${jobList}:recruiter-dashboard`)
  await invalidateAdminJobCaches(jobId);

  return updatedJob;
};

export const deleteJobByAdmin = async (jobId) => {
  const existingJob = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true },
  });

  if (!existingJob) throw new AppError("Job not found", 404);

  const applicants = await prisma.application.findMany({
    where: {
      jobId,
    },
  });

  if (applicants.length > 0) {
    throw new AppError("Job cannot be deleted as it has applicants", 400);
  } 

  await prisma.job.delete({ where: { id: jobId } });

  await invalidateAdminJobCaches(jobId);

  return { id: jobId, deleted: true };
};

export const getAdminJobs = async (searchParams) => {
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status") || "";
  const employmentType = searchParams.get("employmentType") || "";
  const experienceLevel = searchParams.get("experienceLevel") || "";
  const isFeatured = parseBooleanParam(searchParams.get("isFeatured"));
  const companyId = searchParams.get("companyId") || "";

  const page = parsePositiveInteger(searchParams.get("page"), 1, 1000000);
  const limit = parsePositiveInteger(searchParams.get("limit"), 10, 100);

  const sort = searchParams.get("sort") || "newest";
  const orderBy = ADMIN_JOB_SORTS[sort];

  if (!orderBy) {
    throw new AppError("Invalid sort option", 400);
  }

  const validStatuses = ["DRAFT", "ACTIVE", "CLOSED", "EXPIRED"];
  const validEmploymentTypes = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
  ];

  // Adjust these enum values to the exact values in your Prisma schema.
  if (status && !validStatuses.includes(status)) {
    throw new AppError("Invalid job status", 400);
  }

  if (employmentType && !validEmploymentTypes.includes(employmentType)) {
    throw new AppError("Invalid employment type", 400);
  }

  const where = {
    ...(status && { status }),
    ...(employmentType && { employmentType }),
    ...(experienceLevel && { experienceLevel }),
    ...(typeof isFeatured === "boolean" && { isFeatured }),
    ...(companyId && { companyId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          company: {
            is: { name: { contains: search, mode: "insensitive" } },
          },
        },
      ],
    }),
  };

  const cacheKey = `${ADMIN_JOB_LIST_CACHE_PREFIX}:${JSON.stringify({
    search,
    status,
    employmentType,
    experienceLevel,
    isFeatured,
    companyId,
    page,
    limit,
    sort,
  })}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.error("Admin jobs cache read failed:", error);
  }

  const [jobs, totalCount, totalJobs, featuredCount, activeCount, draftCount] =
    await prisma.$transaction([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [orderBy, { id: "asc" }],
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              country: true,
              isVerified: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              user: { select: { name: true, email: true } },
            },
          },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
      prisma.job.count(),
      prisma.job.count({ where: { isFeatured: true } }),
      prisma.job.count({ where: { status: "ACTIVE" } }),
      prisma.job.count({ where: { status: "DRAFT" } }),
    ]);

  const totalPages = Math.ceil(totalCount / limit);

  const result = {
    jobs,
    metadata: {
      currentPage: page,
      pageSize: limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    stats: {
      totalJobs,
      featuredCount,
      activeCount,
      draftCount,
    },
  };

  try {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);
  } catch (error) {
    console.error("Admin jobs cache write failed:", error);
  }

  return result;
};

export const getAdminJobById = async (jobId) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          websiteUrl: true,
          country: true,
          industry: true,
          isVerified: true,
          owner: {
            select: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      recruiter: {
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true } },
          companyId: true,
        },
      },
      skills: true,
      _count: {
        select: {
          applications: true,
          savedBy: true,
        },
      },
    },
  });

  if (!job) throw new AppError("Job not found", 404);

  const groupedApplications = await prisma.application.groupBy({
    by: ["status"],
    where: { jobId },
    _count: { _all: true },
  });

  const breakdown = {
    PENDING: 0,
    REVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };

  for (const item of groupedApplications) {
    breakdown[item.status] = item._count._all;
  }

  return {
    ...job,
    applicationStats: {
      total: groupedApplications.reduce(
        (sum, item) => sum + item._count._all,
        0
      ),
      breakdown,
    },
  };
};

