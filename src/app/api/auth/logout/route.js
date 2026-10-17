import { redis } from "@/lib/redis";
import { getCurrentUser } from "@/utils/auth";
import { userKey } from "@/utils/redisKeyNames";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, message: "Not Authenticated!" }, { status: 401 })
        };

        const response = NextResponse.json({ success: true, message: "Logout successfully!" }, { status: 200 });

        const cookies = response.cookies;
        cookies.delete('access-token');
        cookies.delete('refresh-token');

        await redis.del(`${userKey}:${currentUser.id}`)

        return response;

    } catch (error) {
        console.log("Error in logout route", error);
        return NextResponse.json({ success: false, message: "Internal Server Error!" }, { status: 500 })
    }
};