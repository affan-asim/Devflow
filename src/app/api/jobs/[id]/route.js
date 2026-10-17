import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { jobSchema, updateJobSchemaSchema } from "@/validations/jobs";
import { createJob, deleteJob, getJob, getJobs, updateJob } from "@/services/jobs/jobService";

export async function GET(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;
        const jobs = await getJob(id,userRole,userId);

        if (!jobs) {
            return NextResponse.json({
                success: false,
                error: "Jobs not found. Try changing id."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: jobs
        }, { status: 200 });

    } catch (error) {
        console.error("GET JOB PROFILE ERROR:", error);
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

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recuiter can update job."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = updateJobSchemaSchema.parse(body);

        const job = await updateJob(id, validatedData, userId);

        return NextResponse.json({
            success: true,
            message: "Job updated successfully!",
            data: job
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
        console.error("JOB UPDATE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recuiter can delete job."
            }, { status: 403 });
        }

        const job = await deleteJob(id, userId);

        if (!job) {
            return NextResponse.json({
                success: false,
                error: "Job not found."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Job deleted successfully!",
            data: job
        }, { status: 200 });

    } catch (error) {
        console.error("DELETE JOB PROFILE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}