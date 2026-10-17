import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { invitationRecievedSchema } from "@/validations/employment-history";
import { getRecruiterInvitationDetail, recievedInvitation } from "@/services/recruiterHistory/recruiterHistotryService";

export async function GET(req, { params }) {
    try {
        const userId = req.headers.get("x-user-id");
        const userRole = req.headers.get("x-user-role");
        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({ success: false, error: "Forbidden. Only recruiters can view invitations." }, { status: 403 });
        }

        const { id } = await params;
        const invitation = await getRecruiterInvitationDetail(userId, id);
        return NextResponse.json({ success: true, data: invitation }, { status: 200 });
    } catch (error) {
        if (error instanceof AppError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        console.error("GET RECRUITER INVITATION ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recruiter can receive the invitation email."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = invitationRecievedSchema.parse(body);

        const invitation = await recievedInvitation(userId, validatedData, id);

        return NextResponse.json({
            success: true,
            message: "Invitation status updated successfully!",
            data: invitation
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({
                success: false,
                error: "Validation Error",
                details: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
            }, { status: 400 });
        }

        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }

        console.error("COMAPNY CRITICAL ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};
