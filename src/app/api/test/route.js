import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { fixedWindow, tokenBucket } from "@/services/rateLimiter/rateLimiter";

export async function GET(req) {
    try {
        const userId = req.headers.get("x-user-role");
        const data = await tokenBucket(userId);

        return NextResponse.json({
            success: true,
            data: data.message
        }, { status: 200 });

    } catch (error) {
        console.error("GET rate limiter ERROR:", error);

        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};
