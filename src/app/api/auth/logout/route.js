import { redis } from "@/lib/redis";
import { getCurrentUser, hashedToken } from "@/utils/auth";
import { userKey } from "@/utils/redisKeyNames";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, message: "Not Authenticated!" }, { status: 401 })
        };

        const cookieStore = await cookies();
        const rawRefreshToken = cookieStore.get('refresh-token')?.value;

        if (rawRefreshToken) {
            const tokenHash = hashedToken(rawRefreshToken);
            await prisma.refreshToken.updateMany({
                where: {
                    hashedToken: tokenHash,
                    userId: currentUser.id,
                    revoked: false
                },
                data: {
                    revoked: true
                }
            });
        } else {
            await prisma.refreshToken.updateMany({
                where: {
                    userId: currentUser.id,
                    revoked: false
                },
                data: {
                    revoked: true
                }
            });
        }

        const response = NextResponse.json({ success: true, message: "Logout successfully!" }, { status: 200 });

        const responseCookies = response.cookies;
        responseCookies.delete('access-token');
        responseCookies.delete('refresh-token');

        await redis.del(`${userKey}:${currentUser.id}`);

        return response;

    } catch (error) {
        console.log("Error in logout route", error);
        return NextResponse.json({ success: false, message: "Internal Server Error!" }, { status: 500 })
    }
};