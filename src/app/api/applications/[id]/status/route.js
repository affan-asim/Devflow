import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { updateApplicationSchemaStatus } from "@/validations/applications";
import { deleteApplication, getApplicationForDeveloper, getApplicationForRecuiter, updateApplication, updateApplicationStatus } from "@/services/application/applicationService";

export async function PATCH(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recuiter can chnage status of applications."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = updateApplicationSchemaStatus.parse(body);

        const application = await updateApplicationStatus(id, validatedData, userId);

        return NextResponse.json({
            success: true,
            message: "Application updated successfully!",
            data: application
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
        console.error("APPLICATION UPDATE STATUS ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};