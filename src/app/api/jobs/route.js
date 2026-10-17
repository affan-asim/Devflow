import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { jobSchema } from "@/validations/jobs";
import { createJob, getJobs } from "@/services/jobs/jobService";

export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    const searchParams = req.nextUrl.searchParams;
    const searchParamsObject = Object.fromEntries(searchParams.entries());
    const referer = req.headers.get("referer");
    const fromRecruiterJobsPage = referer && (() => {
      try {
        const refererUrl = new URL(referer);
        return refererUrl.origin === req.nextUrl.origin &&
          refererUrl.pathname.replace(/\/$/, "") === "/dashboard/recruiter/jobs" || refererUrl.pathname.replace(/\/$/, "") === "/dashboard/recruiter/applications";
      } catch {
        return false;
      }
    })();


    const jobs = await getJobs(searchParams, searchParamsObject, userId, userRole, fromRecruiterJobsPage);

    if (!jobs) {
      return NextResponse.json({
        success: false,
        error: "Jobs not found. Try changing filters."
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: jobs
    }, { status: 200 });

  } catch (error) {
    console.error("GET JOBS PROFILE ERROR:", error);
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

    if (userRole !== ROLE.RECRUITER) {
      return NextResponse.json({
        success: false,
        error: "Forbidden. Only recuiters can create jobs."
      }, { status: 403 });
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const validatedData = jobSchema.parse(body);

    const job = await createJob(userId, validatedData);

    return NextResponse.json({
      success: true,
      message: "Job created successfully!",
      data: job
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

    console.error("JOB CRITICAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};
