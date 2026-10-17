import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { jobSchema } from "@/validations/jobs";
import { createJob, getJobs } from "@/services/jobs/jobService";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function GET(req) {
    try {
        const res = await redis.ping();

        return NextResponse.json({
            success: true,
            data: res
        }, { status: 200 });

    } catch (error) {
        console.error("redis error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}