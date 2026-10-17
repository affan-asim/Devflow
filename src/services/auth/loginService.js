import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { getRefreshTableInfo, hashedPassword, hashedToken, verifyPassword } from "@/utils/auth";
import { UAParser } from "ua-parser-js";

import prisma from "@/utils/prisma";

export async function loginUser(userData) {
    const { email, password } = userData;

    const userExist = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!userExist) {
        throw new AppError("Invalid credentials", 401);
    }

    if (!userExist.isVerified) {
        throw new AppError("User not verified, Please verify your email first", 400);
    }

    const isPasswordCorrect = await verifyPassword(password, userExist.password);

    if (!isPasswordCorrect) {
        throw new AppError("Invalid credentials", 401);
    }

    return userExist;
}

export async function createRefreshToken(userId, token, req) {
    const refreshData = getRefreshTableInfo(req)
    const hashedRefreshToken = hashedToken(token);

    await prisma.refreshToken.create({
        data: {
            hashedToken: hashedRefreshToken,
            deviceName: refreshData.deviceName,
            expiresAt: refreshData.expiresAt,
            ipAddress: refreshData.ipAddress,
            userAgent: refreshData.userAgent,
            userId
        }
    });
};
