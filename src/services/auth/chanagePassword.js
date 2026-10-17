import bcrypt from 'bcrypt'
import { AppError } from "@/utils/AppError";
import { PrismaClient } from "@/generated/prisma/client";
import { redis } from "@/lib/redis";
import { userKey } from "@/utils/redisKeyNames";

import prisma from "@/utils/prisma";

export const changePassword = async (userId, data) => {
  const { currentPassword, newPassword } = data;

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new AppError("Incorrect current password", 400);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError(
        "New password cannot be the same as your current password",
        400
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await tx.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await tx.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: { revoked: true },
    });

    await redis.del(`${userKey}:${userId}`);

    return true;
  });
};