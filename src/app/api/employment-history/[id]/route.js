import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { getEmploymentHistory, getEmploymentHistoryRecuiter, updateEmploymentHistory } from "@/services/employmentHistory/employmentHistoryService";
import { employmentHistorySchema } from "@/validations/employment-history";

export async function GET(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole === ROLE.DEVELOPER) {
            const history = await getEmploymentHistory(id, userId);

            return NextResponse.json({
                success: true,
                data: history
            }, { status: 200 });
        }

        if (userRole === ROLE.RECRUITER) {
            const history = await getEmploymentHistoryRecuiter(id, userId);

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

export async function PATCH(req, {params}) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recuiter can update employment history."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = employmentHistorySchema.parse(body);

        const history = await updateEmploymentHistory(id,userId, validatedData);

        return NextResponse.json({
            success: true,
            message: "Employment history updated successfully!",
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
        console.error("EMPLOYMENT HISTORY UPDATE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};