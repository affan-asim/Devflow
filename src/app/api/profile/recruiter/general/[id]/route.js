import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma/client";
import { getRecruiterProfileDetail } from "@/services/profile/recuiterService";
import { AppError } from "@/utils/AppError";

export async function GET(req, { params }) {
    try {
        const userId = req.headers.get("x-user-id");
        const viewerUserId = req.headers.get("x-user-role") === ROLE.RECRUITER ? userId : null;
        const { id } = await params;
        const profile = await getRecruiterProfileDetail(viewerUserId, id);
        return NextResponse.json({ success: true, data: profile }, { status: 200 });
    } catch (error) {
        if (error instanceof AppError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        console.error("GET RECRUITER DETAIL ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
