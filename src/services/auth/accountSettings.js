import { AppError } from "@/utils/AppError";
import { PrismaClient } from "@/generated/prisma/client";
import { userKey } from "@/utils/redisKeyNames";
import { redis } from "@/lib/redis";

import prisma from "@/utils/prisma";

export const updateAccount = async (userId, data) => {
  const { name } = data;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: name.trim(),
    },
    omit: {
      password: true,
    },
  });

  await redis.del(`${userKey}:${userId}`);

  return updatedUser;
};