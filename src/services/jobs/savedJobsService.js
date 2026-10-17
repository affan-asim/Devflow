import { AppError } from "@/utils/AppError";
import Redis from "ioredis";
import { PrismaClient } from "@/generated/prisma/client";
import { cacheInvalidate, getCacheKey } from "@/utils/helper";
import { redis } from "@/lib/redis";
import { SAVED_JOBS_CACHE_PREFIX } from "@/utils/redisKeyNames";

import prisma from "@/utils/prisma";

export const createSavedJob = async (userId, jobId) => {
  const res =  await prisma.$transaction(async (tx) => {
    const profile = await tx.developerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new AppError("Profile is not found", 404);
    }

    const job = await tx.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
        status: true,
        deadline: true,
      },
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (job.status !== "ACTIVE") {
      throw new AppError(
        "Only active jobs can be saved",
        400
      );
    }

    if (job.deadline && job.deadline < new Date()) {
      throw new AppError(
        "This job application deadline has passed",
        400
      );
    }

    const existing = await tx.savedJob.findFirst({
      where: {
        jobId,
        devProfileId: profile.id,
      },
    });

    if (existing) {
      throw new AppError(
        "You already saved this job",
        409
      );
    }

    const savedJob = await tx.savedJob.create({
      data: {
        devProfileId: profile.id,
        jobId,
      },
    });

    await cacheInvalidate(`${SAVED_JOBS_CACHE_PREFIX}:${profile.id}`);

    return savedJob;
  });

  return res;
};

/**
 * GET ALL SAVED JOBS
 */
export const getSavedJobs = async (userId, searchParams, searchParamsObject) => {
  const profile = await prisma.developerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Profile is not found", 404);
  }

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("limit") || 10);
  const currentPage = Math.max(1, page);
  const limit = Math.max(1, pageSize);

  const where = {
    devProfileId: profile.id,
  };

  const cacheKey = await getCacheKey(`${SAVED_JOBS_CACHE_PREFIX}:${profile.id}`, searchParamsObject);
  let cachedData = null;

  try {
    const rawData = await redis.get(cacheKey);
    cachedData = rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error("Redis parsing failed, falling back to DB:", error);
  }

  if (cachedData && cachedData.savedJobs && cachedData.metadata) {
    return {
      savedJobs: cachedData.savedJobs,
      metadata: cachedData.metadata,
    };
  }

  const [savedJobs, totalCount] = await prisma.$transaction([
    prisma.savedJob.findMany({
      where,
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                country: true,
                industry: true,
                logo: true,
                isVerified: true,
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
        },
      },
      take: limit,
      skip: (currentPage - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.savedJob.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const metadata = {
    currentPage,
    pageSize: limit,
    totalCount,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };

  const responseData = { savedJobs, metadata };

  try {
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 300, "NX");
  } catch (error) {
    console.error("Failed to save to Redis cache:", error);
  }

  return responseData;
};

export const getSavedJobById = async (userId, savedJobId) => {
  const profile = await prisma.developerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Profile is not found", 404);
  }

  const savedJob = await prisma.savedJob.findFirst({
    where: {
      id: savedJobId,
      devProfileId: profile.id,
    },
    include: {
      job: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              country: true,
              industry: true,
              logo: true,
              isVerified: true,
            },
          },
          skills: true,
        },
      },
    },
  });

  if (!savedJob) {
    throw new AppError("Saved job record not found", 404);
  }

  const application = await prisma.application.findFirst({
    where: {
      jobId: savedJob.jobId,
      devProfileId: profile.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  return { savedJob, application };
};

export const deleteSavedJob = async (userId, savedJobId) => {
  const res =  await prisma.$transaction(async (tx) => {
    const profile = await tx.developerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError("Profile is not found", 404);
    }

    const savedJob = await tx.savedJob.findFirst({
      where: {
        id: savedJobId,
        devProfileId: profile.id,
      },
    });

    if (!savedJob) {
      throw new AppError("Saved job record not found", 404);
    }

    const deleted = await tx.savedJob.delete({
      where: {
        id: savedJob.id,
      },
    });

    await cacheInvalidate(`${SAVED_JOBS_CACHE_PREFIX}:${profile.id}`);

    return deleted;
  });

  return res;
};