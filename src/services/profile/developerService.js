import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { getExistingSkillConnections } from "@/services/skills/skills";
import { developerProfileKey } from "@/utils/redisKeyNames";
import Redis from "ioredis";
import { checkTempKey, promoteTempFileToPermanent } from "../presignedUrl/presignedUrl";
import { STATUS } from "@/generated/prisma/client";
import { da } from "zod/v4/locales";
import { ExperienceLevel } from "@/generated/prisma/client";
import { storageQueue } from "@/lib/queues/s3";

import prisma from "@/utils/prisma";
import { getRecuiterProfile } from "./recuiterService";
import { LOCATION } from "@/generated/prisma/client";
const redis = new Redis();

function mapYearsToExperienceLevels(years) {
  if (years === null) return [ExperienceLevel.BEGINNER, ExperienceLevel.INTERMEDIATE, ExperienceLevel.EXPERT];

  if (years < 2) {
    return [ExperienceLevel.BEGINNER];
  } else if (years <= 5) {
    return [ExperienceLevel.BEGINNER, ExperienceLevel.INTERMEDIATE];
  } else {
    return [ExperienceLevel.INTERMEDIATE, ExperienceLevel.EXPERT];
  }
}

export async function getDevelopers(searchParams, userId) {
  const bio = searchParams.get("bio");
  const locationPreference = searchParams.get("locationPreference");
  const minExp = searchParams.get("minExp");
  const maxExp = searchParams.get("maxExp");
  const skills = searchParams.get("skills");
  const sort = searchParams.get("sort");
  const companyId = searchParams.get("companyId");

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("limit") || 10);

  const currentPage = Math.max(1, page);
  const limit = Math.max(1, pageSize);

  const where = {};

  if (companyId) {
    const profile = await getRecuiterProfile(userId);

    if (!profile) {
      throw new AppError("Recruiter profile not found.", 404);
    }
  
    const company = await prisma.company.findUnique({
      where: {
        id: profile.companyId,
        isVerified: true,
      },
      select: {
        id: true,
        ownerId: true,
      },
    });
  
    if (!company) {
      throw new AppError(
        "Company is not found or not verified.",
        404
      );
    }

    where.employmentHistory = {
      some: {
        companyId: company.id,
        isCurrent: true,
      }
    }
  }

  if (bio) {
    where.bio = {
      contains: bio,
      mode: "insensitive",
    };
  }

  if (locationPreference) {
    where.locationPreference = locationPreference;
  }

  if (minExp || maxExp) {
    where.yearsOfExp = {};
    if (minExp) where.yearsOfExp.gte = Number(minExp);
    if (maxExp) where.yearsOfExp.lte = Number(maxExp);
  }

  if (skills) {
    const skillsList = skills.split(",").map((skill) => skill.trim()).filter(Boolean);
    if (skillsList.length > 0) {
    where.skills = {
      some: {
        name: {
          in: skillsList,
          mode: "insensitive",
        },
      },
    };
    }
  }

  let orderBy = {
    yearsOfExp: "desc",
  };

  if (sort) {
    if (sort === "asc" || sort === "exp_asc") {
      orderBy = { yearsOfExp: "asc" };
    } else if (sort === "desc" || sort === "exp_desc") {
      orderBy = { yearsOfExp: "desc" };
    }
  }

  let cachedData = null;

  try {
    const rawData = await redis.get(cacheKey);
    cachedData = rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error("Redis parsing failed, falling back to DB:", error);
  }

  if (cachedData && cachedData.developers && cachedData.metadata) {
    return {
      developers: cachedData.developers,
      metadata: cachedData.metadata,
    };
  }

  const [developers, totalCount] = await prisma.$transaction([
    prisma.developerProfile.findMany({
      where,
      select: {
        id: true,
        userId: true,
        bio: true,
        githubUrl: true,
        portfolioUrl: true,
        locationPreference: true,
        yearsOfExp: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        skills: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        resume: {
          select: {
            id: true,
            key: true,
          },
        },
      },
      take: limit,
      skip: (currentPage - 1) * limit,
      orderBy,
    }),
    prisma.developerProfile.count({ where }),
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

  const responseData = { developers, metadata };

  try {
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 600, "NX");
  } catch (error) {
    console.error("Failed to save to Redis cache:", error);
  }

  return responseData;
}

export async function getDeveloperProfile(userId) {
  let cachedData = null;

  try {
    const rawData = await redis.get(`${developerProfileKey}:${userId}`);
    cachedData = rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error("Redis parsing failed, falling back to DB:", error);
  }

  if (cachedData && Object.keys(cachedData).length > 0) {
    return cachedData;
  };

  const profile = await prisma.developerProfile.findUnique({
    where: {
      userId,
    },
    include: {
      skills: true,
      employmentHistory: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          hiredByRecruiter: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      },

      user: {
        omit: {
          password: true,
        },
      },
    },
  });

  if (profile) {
    const { applications, ...cacheableProfile } = profile;

    try {
      await redis.set(`${developerProfileKey}:${userId}`, JSON.stringify(cacheableProfile), 'EX', 3600);

    } catch (error) {
      console.error("Failed to save to Redis cache:", error);
    }
  }

  return profile;
}

export async function createDeveloperProfile(userId, profileData) {
  const { yearsOfExp, bio, skills, githubUrl, portfolioUrl, locationPreference, tempKey } = profileData;

  const [existingProfile, skillsConnection] = await Promise.all([
    prisma.developerProfile.findUnique({ where: { userId } }),
    getExistingSkillConnections(skills),
  ]);

  if (existingProfile) {
    throw new AppError("Developer profile already exists for this user.", 400);
  }

  const profile = await prisma.developerProfile.create({
    data: {
      userId,
      bio,
      githubUrl,
      portfolioUrl,
      yearsOfExp,
      locationPreference,
      skills: {
        connect: skillsConnection,
      },
    },
    include: {
      skills: true,
    },
  });

  if (tempKey) {
    checkTempKey(tempKey, userId);
    await storageQueue.add(
      "storage",
      {
        tempKey,
        userId,
        fileType: "RESUME",
        model: "profile",
        developerProfileId: profile.id,
      },
      { jobId: `storage-profile-${profile.id}-resume` }
    );
  }

  return profile;
}

export async function updateDeveloperProfile(userId, updateData) {
  const { bio, yearsOfExp, skills, githubUrl, portfolioUrl, locationPreference, tempKey } = updateData;

  const profile = await prisma.developerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Developer profile not found.", 404);
  }

  let updatedSkillsConnection;
  if (skills && Array.isArray(skills)) {
    const formattedSkills = await getExistingSkillConnections(skills);
    updatedSkillsConnection = {
      set: [],
      connect: formattedSkills,
    };
  }

  const tasks = [];

  if (tempKey) {
    checkTempKey(tempKey, userId);
    tasks.push(
      storageQueue.add(
        "storage",
        {
          tempKey,
          userId,
          fileType: "RESUME",
          model: "profile",
          developerProfileId: profile.id,
        },
        { jobId: `storage-profile-${profile.id}-resume-${Date.now()}` }
      )
    );
  }

  tasks.push(
    prisma.developerProfile.update({
      where: { userId },
      data: {
        bio,
        githubUrl,
        yearsOfExp,
        portfolioUrl,
        locationPreference,
        ...(updatedSkillsConnection && { skills: updatedSkillsConnection }),
      },
      include: {
        skills: true,
      },
    })
  );

  tasks.push(redis.del(`${developerProfileKey}:${userId}`));

  const results = await Promise.all(tasks);

  return tempKey ? results[1] : results[0];
}

export async function developerDashboard(userId) {
  const profile = await prisma.developerProfile.findUnique({
    where: { userId },
    include: {
      _count: {
        select: {
          skills: true,
          employmentHistory: true,
        },
      },
    },
  });

  if (!profile) {
    throw new AppError("Create profile first", 404);
  }

  const checks = [
    { weight: 10, isComplete: Boolean(profile.bio?.trim()) },
    { weight: 10, isComplete: Boolean(profile.githubUrl) },
    { weight: 10, isComplete: Boolean(profile.portfolioUrl) },
    { weight: 20, isComplete: Boolean(profile.resumeId) },
    { weight: 10, isComplete: Boolean(profile.locationPreference) },
    { weight: 10, isComplete: profile.yearsOfExp !== null },
    { weight: 15, isComplete: profile._count.skills > 0 },
    { weight: 15, isComplete: profile._count.employmentHistory > 0 },
  ];

  const completenessPercentage = checks.reduce(
    (score, item) => (item.isComplete ? score + item.weight : score),
    0
  );

  const whereDev = { devProfileId: profile.id };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [
    totalApplications,
    pendingApplications,
    reviewApplications,
    acceptedApplications,
    rejectedApplications,
    activity,
    recentApplications,
    recentNotifications,
    recommendedJobs,
  ] = await Promise.all([
    prisma.application.count({ where: whereDev }),
    prisma.application.count({ where: { ...whereDev, status: STATUS.PENDING } }),
    prisma.application.count({ where: { ...whereDev, status: STATUS.REVIEW } }),
    prisma.application.count({ where: { ...whereDev, status: STATUS.ACCEPTED } }),
    prisma.application.count({ where: { ...whereDev, status: STATUS.REJECTED } }),
    
    prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS date,
        COUNT(id)::int AS count
      FROM "Application"
      WHERE "devProfileId" = ${profile.id}
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date DESC
    `,

    prisma.application.findMany({
      where: whereDev,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            employmentType: true,
            experienceLevel: true,
            isFeatured: true,
            locationPreference: true,
            maxSalary: true,
            minSalary: true,
            skills: true,
            company: {
              select: {
                id: true,
                name: true,
                country: true,
                logo: true,
              },
            },
          },
        },
      },
    }),

    prisma.notification.findMany({
      where: { recipientId: profile.userId },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),

    relatedJobs(profile.userId),
  ]);

  const stats = {
    totalApplications,
    pendingApplications,
    reviewApplications,
    acceptedApplications,
    rejectedApplications,
  };

  const applicationAnalytics = {
    statusDistribution: {
      pending: pendingApplications,
      review: reviewApplications,
      accepted: acceptedApplications,
      rejected: rejectedApplications,
    },
    activity,
  };

  return {
    profile: {
      ...profile,
      completenessPercentage,
    },
    stats,
    applicationAnalytics,
    recommendedJobs,
    recentApplications,
    recentNotifications,
  };
}

export async function relatedJobs(userId) {
  const profile = await prisma.developerProfile.findUnique({
    where: {
      userId
    },
    include: {
      skills: true
    }
  })

  if (!profile) {
    throw new AppError("Create profile first", 404)
  }

  const experience = mapYearsToExperienceLevels(profile.yearsOfExp);
  const skillsIds = profile.skills.map((s) => s.id);

  const jobs = await prisma.job.findMany({
    where: {
      status: "ACTIVE",
      deadline: {
        gte: new Date()
      },
      OR: [
        { skills: { some: { id: { in: skillsIds } } } },
        ...(profile.locationPreference ? [{ locationPreference: profile.locationPreference }] : []),
        { experienceLevel: { in: experience } }
      ],
      applications: {
        none: {
          devProfileId: profile.id
        }
      }
    },
    include: {
      company: { select: { name: true, logo: true, country: true } },
      skills: { select: { id: true, name: true } },
    },
    take: 5,
  });

  const scoredJobs = jobs.map((job) => {
    let score = 0;

    const jobSkillIds = job.skills.map((j) => j.id);
    const sharedSkills = jobSkillIds.filter((j) => skillsIds.includes(j));
    const skillMatchRatio = jobSkillIds.length > 0 ? sharedSkills.length / jobSkillIds.length : 0;
    score += skillMatchRatio * 50;

    if (profile.locationPreference && job.locationPreference === profile.locationPreference) {
      score += 30;
    } else if (job.locationPreference === LOCATION.REMOTE) {
      score += 15;
    }

    if (experience.includes(job.experienceLevel)) {
      score += 20;
    }

    return {
      ...job,
      matchScore: Math.round(score),
      matchedSkillCount: sharedSkills.length,
    }
  })

  return scoredJobs
    .filter((job) => job.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || b.publishedAt.getTime() - a.publishedAt.getTime());
}
