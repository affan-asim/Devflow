import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import Redis from "ioredis";
import { otpKey, userKey } from "@/utils/redisKeyNames";
import { ROLE } from "@/generated/prisma";

import prisma from "@/utils/prisma";
import { redis } from "@/lib/redis";

export async function getUser(userId) {
  let cachedData = null;

  try {
    const rawData = await redis.get(`${userKey}:${userId}`);
    cachedData = rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error("Redis parsing failed, falling back to DB:", error);
  }

  if (cachedData && Object.keys(cachedData).length > 0) {
    return cachedData;
  };

  const user = await prisma.user.findFirst({
    where: {
      id: userId
    },
    include: {
      developerProfile: {
        select: {
          id: true,
        }
      },
      recruiterProfile: {
        select: {
          id: true,
          companyId: true,
          company: {
            select: {
              id: true
            }
          }
        }
      }
    },
    omit: {
      password: true
    }
  });

  try {
    await redis.set(`${userKey}:${userId}`, JSON.stringify(user), 'EX', 600, 'NX');

  } catch (error) {
    console.error("Failed to save to Redis cache:", error);
  }

  return user;
}

export const getUsersList = async (queryParams) => {
  const {
    page = 1,
    limit = 20,
    role,
    isActive,
    isVerified,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const parsedPage = Math.max(1, parseInt(page, 10));
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (parsedPage - 1) * parsedLimit;

  const where = {
    NOT: {
      role: ROLE.ADMIN
    }
  };

  if (role) {
    where.role = role.toUpperCase();
  }

  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  if (isVerified !== undefined) {
    where.isVerified = isVerified === "true";
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: parsedLimit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        developerProfile: {
          select: {
            id: true,
            yearsOfExp: true,
            locationPreference: true,
          },
        },
        recruiterProfile: {
          select: {
            id: true,
            companyId: true,
            jobTitle: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};

export const getUserByIdDetails = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      isActive: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      files: {
        select: {
          id: true,
          key: true,
          type: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  let profileDetails = null;

  if (user.role === "DEVELOPER") {
    profileDetails = await prisma.developerProfile.findUnique({
      where: { userId },
      include: {
        skills: { select: { id: true, name: true, category: true } },
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: { select: { id: true, name: true } },
              },
            },
          },
        },
        employmentHistory: {
          orderBy: { startDate: "desc" },
          include: {
            company: { select: { id: true, name: true } },
          },
        },
      },
    });
  } else if (user.role === "RECRUITER") {
    profileDetails = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            websiteUrl: true,
            industry: true,
            country: true,
            isVerified: true,
          },
        },
        jobs: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        recruiterHistory: {
          orderBy: { startDate: "desc" },
          include: {
            company: { select: { id: true, name: true } },
            recruiterEvents: true,
          },
        },
        recruiterInvitesReceived: {
          orderBy: { createdAt: "desc" },
          include: { company: { select: { id: true, name: true } } },
        },
        recruiterInvitesSender: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  return {
    ...user,
    profile: profileDetails,
  };
};

export const updateUserStatus = async (adminId, targetUserId, isActive) => {
  // 1. Check self-deactivation rule
  if (adminId === targetUserId && !isActive) {
    throw new AppError("You cannot deactivate your own admin account", 400);
  }

  // 2. Fetch target user
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, isActive: true },
  });

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  // 3. No-op check if status isn't changing
  if (targetUser.isActive === isActive) {
    return targetUser;
  }

  if (targetUser.role === ROLE.ADMIN && !isActive) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: ROLE.ADMIN,
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new AppError("Cannot deactivate the last active administrator", 400);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  await redis.del(`${userKey}:${targetUserId}`);

  return updatedUser;
  
};