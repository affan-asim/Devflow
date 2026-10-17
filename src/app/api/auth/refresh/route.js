import { newTokens, refreshService } from "@/services/auth/refreshService";
import { AppError } from "@/utils/AppError";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req) {
    try {
        const session = await refreshService();
        const res = await newTokens(session,req);
        return res;

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({
                error: 'Validation Error',
                details: error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                })),
                success: false
            }, { status: 400 });
        }

        if (error instanceof AppError) {
            return NextResponse.json({
                error: error.message,
                success: false
            }, { status: error.statusCode });
        }

        console.error("CRITICAL SERVER ERROR:", error);
        return NextResponse.json({
            success: false,
            error: "Internal Server Error"
        }, { status: 500 });
    }
}