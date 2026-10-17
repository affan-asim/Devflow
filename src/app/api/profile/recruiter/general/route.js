import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { getRecuiterProfileList } from "@/services/profile/recuiterService";
import { ROLE } from "@/generated/prisma/client";

export async function GET(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const searchParams = req.nextUrl.searchParams;
        const viewerUserId = req.headers.get('x-user-role') === ROLE.RECRUITER ? userId : null;
        const profiles = await getRecuiterProfileList(searchParams, viewerUserId);

        return NextResponse.json({
            success: true,
            data: profiles
        }, { status: 200 });

    } catch (error) {
        console.error("GET RECUITER PROFILE ERROR:", error);
        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
