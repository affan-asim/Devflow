import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { updateApplicationSchema } from "@/validations/applications";
import { deleteApplication, getApplicationForDeveloper, getApplicationForRecuiter, updateApplication } from "@/services/application/applicationService";

export async function GET(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const searchParams = req.nextUrl.searchParams;
        const { id } = await params;

        if (userRole === ROLE.DEVELOPER) {
            const application = await getApplicationForDeveloper(id, userId);

            if (!application) {
                return NextResponse.json({ 
                    success: false, 
                    error: "Provide correct jobId" 
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: application
            }, { status: 200 });
        }

        if (userRole === ROLE.RECRUITER) {
            const applications = await getApplicationForRecuiter(id, userId, searchParams);

            return NextResponse.json({
                success: true,
                data: applications
            }, { status: 200 });
        }

        return NextResponse.json({
            success: false,
            error: "Invalid or missing x-user-role header"
          }, { status: 400 });

    } catch (error) {
        console.error("GET APPLICATION ERROR:", error);
        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole !== ROLE.DEVELOPER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only developers can update their applications."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = updateApplicationSchema.parse(body);

        const application = await updateApplication(id, validatedData, userId);

        return NextResponse.json({
            success: true,
            message: application.message
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
        console.error("APPLICATION UPDATE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};

export async function DELETE(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole !== ROLE.DEVELOPER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only developers can delete their applications."
            }, { status: 403 });
        }

        const application = await deleteApplication(id, userId);

        return NextResponse.json({
            success: true,
            message: "Application deleted successfully!",
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
        console.error("APPLICATION DELETE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};
