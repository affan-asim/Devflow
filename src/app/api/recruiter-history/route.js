import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { getRecruiterHistory } from "@/services/recruiterHistory/recruiterHistotryService";

export async function GET(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const searchParams = req.nextUrl.searchParams;

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recuiter can see their employment history."
            }, { status: 403 });
        }

        const history = await getRecruiterHistory(searchParams, userId);

        return NextResponse.json({
            success: true,
            data: history
        }, { status: 200 });

    } catch (error) {
        console.error("GET EMPLOYEMENT HISTORY PROFILE ERROR:", error);
        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};
