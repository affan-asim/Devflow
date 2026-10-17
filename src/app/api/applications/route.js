import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { applicationSchema } from "@/validations/applications";
import { createApplication, getApplicationsForDeveloper, getApplicationsForRecuiter } from "@/services/application/applicationService";

export async function GET(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const searchParams = req.nextUrl.searchParams


        if (userRole === ROLE.DEVELOPER) {
            const applications = await getApplicationsForDeveloper(searchParams, userId);

            return NextResponse.json({
                success: true,
                data: applications
            }, { status: 200 });
        }

        if (userRole === ROLE.RECRUITER) {
            const applications = await getApplicationsForRecuiter(searchParams, userId);

            return NextResponse.json({
                success: true,
                data: applications
            }, { status: 200 });
        }

    } catch (error) {
        console.error("GET APPLICATIONS PROFILE ERROR:", error);
        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');

        if (userRole !== ROLE.DEVELOPER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only developers can create applications."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = applicationSchema.parse(body);

        const application = await createApplication(userId, validatedData);

        return NextResponse.json({
            success: true,
            message: "Application created successfully!",
            data: application
        }, { status: 201 });

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

        console.error("APPLICATION CRITICAL ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};