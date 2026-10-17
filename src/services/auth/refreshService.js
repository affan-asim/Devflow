import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { generateToken, getRefreshTableInfo, hashedPassword, hashedToken, verifyPassword, verifyToken } from "@/utils/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import prisma from "@/utils/prisma";

export async function refreshService() {
    const cookieStore = await cookies();
    const token = cookieStore.get("refresh-token")?.value;

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
        throw new AppError("Token not found or changed!", 404);
    }

    const hashedTokenRefresh = hashedToken(token)

    const session = await prisma.refreshToken.findFirst({
        where: {
            hashedToken: hashedTokenRefresh,
            userId: decodedToken.userId
        }
    })
    console.log(session, "HERE!---")

    if (!session) {
        throw new AppError("Refresh session not found", 404);
    }

    if (session.revoked) {
        throw new AppError("Session is revoked!", 403);
    }

    if (session.expiresAt < new Date()) {
        throw new AppError("Token is expired!", 400);
    }

    return { session, token };
}

export async function newTokens(data, req) {
    
    let newAccessToken;
    let newRefreshToken;

    const hashedTokenRefresh = hashedToken(data.token)

    await prisma.$transaction(async (tx) => {

        const sessionUser = await tx.refreshToken.update({
            where: {
                userId: data.session.userId,
                hashedToken: hashedTokenRefresh,
            },
            data: {
                revoked: true
            },
            include: {
                user: true
            }
        })

       newAccessToken = generateToken(sessionUser.user.id, sessionUser.user.role, 'access', sessionUser.user.email);
       newRefreshToken = generateToken(sessionUser.user.id, sessionUser.user.role, 'refresh', sessionUser.user.email);

        const hashedTokenRef = hashedToken(newRefreshToken)
        const refreshData = getRefreshTableInfo(req)

        await tx.refreshToken.create({
            data: {
                userId: data.session.userId,
                hashedToken: hashedTokenRef,
                deviceName: refreshData.deviceName,
                expiresAt: refreshData.expiresAt,
                ipAddress: refreshData.ipAddress,
                userAgent: refreshData.userAgent,
            }
        });
    })

    const response = NextResponse.json({ success: true, message: "New Refresh & access token assigned", accessToken: newAccessToken }, { status: 200 });

    response.cookies.set('access-token', newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 1,
        secure: process.env.NODE_ENV === "production"
    });

    response.cookies.set('refresh-token', newRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production"
    });

    return response;
};
