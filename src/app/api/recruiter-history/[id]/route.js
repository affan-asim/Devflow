import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { getRecruiterHistoryDetail, updateRecruiterEmploymentHistory } from "@/services/recruiterHistory/recruiterHistotryService";
import { employmentHistorySchema } from "@/validations/employment-history";

export async function GET(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recuiter can see their employment history detail."
            }, { status: 403 });
        }

        const history = await getRecruiterHistoryDetail(userId, id);

        if (!history) {
            return NextResponse.json({
                success: false,
                error: "Provide correct id to see employment history!."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: history
        }, { status: 200 });

    } catch (error) {
        console.error("GET RECRUITER HISTORY PROFILE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};

export async function PATCH(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only owner can update recruiter employment history."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};
        console.log(body)
        const validatedData = employmentHistorySchema.parse(body);
        console.log(validatedData)
        const history = await updateRecruiterEmploymentHistory(id, userId, validatedData);

        if (!history) {
            return NextResponse.json({
                success: false,
                error: "History not found or the recruiter is no longer in this company."
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            message: "Recruiter Employment history updated successfully!",
            data: history
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
        console.error("RECRUITER EMPLOYMENT HISTORY UPDATE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};