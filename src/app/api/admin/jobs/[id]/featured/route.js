import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { updateJobFeaturedStatus } from "@/services/jobs/jobService";
import { updateJobFeaturedSchema } from "@/validations/jobs";

export async function PATCH(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== ROLE.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Access restricted to administrators only.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const { isFeatured } = updateJobFeaturedSchema.parse(body);

    const updatedJob = await updateJobFeaturedStatus(id, isFeatured);

    return NextResponse.json(
      {
        success: true,
        message: `Job ${isFeatured ? "featured" : "unfeatured"} successfully!`,
        data: updatedJob,
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
    const status = error.statusCode || error.status || 500;
    console.error("ADMIN FEATURE JOB CRITICAL ERROR:", error);
    return NextResponse.json(
      { success: false,     error: status === 500 ? "Failed to update featured status" : error.message, },
      { status: 500 }
    );
  }
}