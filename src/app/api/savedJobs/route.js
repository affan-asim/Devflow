import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { createsavedJobScheama } from "@/validations/savedJobs";
import { createSavedJob, getSavedJobs } from "@/services/jobs/savedJobsService";

export async function GET(req) {
    try {
      const userId = req.headers.get("x-user-id");
      const userRole = req.headers.get("x-user-role");
  
      if (userRole !== ROLE.DEVELOPER) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden. Only developers can view their saved jobs.",
          },
          { status: 403 }
        );
      }
  
      const { searchParams } = new URL(req.url);
      const searchParamsObject = Object.fromEntries(searchParams.entries());
  
      const result = await getSavedJobs(userId, searchParams, searchParamsObject);
  
      return NextResponse.json(
        {
          success: true,
          data: result.savedJobs,
          metadata: result.metadata,
        },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation Error",
            details: error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
  
      if (error instanceof AppError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        );
      }
  
      console.error("GET ALL SAVED JOBS ERROR:", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

export async function POST(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');

        if (userRole !== ROLE.DEVELOPER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only developers can create their saved jobs."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = createsavedJobScheama.parse(body);

        console.log(validatedData)

        const job = await createSavedJob(userId, validatedData);

        return NextResponse.json({
            success: true,
            message: "Saved Job created successfully!",
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

        console.error("SAVED JOB CRITICAL ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};