import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ROLE } from "@/generated/prisma/client";
import { claimExternalRecruiterInvitations } from "@/services/recruiterHistory/recruiterHistotryService";

export async function POST(req) {
    try {
        const userId = req.headers.get("x-user-id");
        const userRole = req.headers.get("x-user-role");

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recruiters can claim recruiter invitations.",
            }, { status: 403 });
        }

        const invitations = await claimExternalRecruiterInvitations(userId);

        return NextResponse.json({
            success: true,
            message: invitations.length
                ? "Invitation(s) linked to your recruiter profile."
                : "No unclaimed invitations were found for your account.",
            data: invitations,
        }, { status: 200 });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }

        console.error("CLAIM RECRUITER INVITATIONS ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
