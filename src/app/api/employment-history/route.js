import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma/client";
import { getEmploymentHistoryList, getEmploymentHistoryListRecruiter } from "@/services/employmentHistory/employmentHistoryService";
import { AppError } from "@/utils/AppError";


export async function GET(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const searchParams = req.nextUrl.searchParams;

        if (userRole === ROLE.DEVELOPER) {
            const history = await getEmploymentHistoryList(searchParams, userId);

            return NextResponse.json({
                success: true,
                data: history
            }, { status: 200 });
        }

        if (userRole === ROLE.RECRUITER) {
            const history = await getEmploymentHistoryListRecruiter(searchParams, userId);

            return NextResponse.json({
                success: true,
                data: history
            }, { status: 200 });
        }

    } catch (error) {
        console.error("GET EMPLOYEMENT HISTORY PROFILE ERROR:", error);
        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};
