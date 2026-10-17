import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { getFailedJobsByQueue } from "@/services/admin/queueService";
import { getFailedJobsQuerySchema } from "@/validations/adminSystem";

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== ROLE.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden. Access restricted to administrators only." },
        { status: 403 }
      );
    }

    const { queue } = await params;

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const { page, limit } = getFailedJobsQuerySchema.parse(queryParams);

    const result = await getFailedJobsByQueue(queue, page, limit);

    return NextResponse.json(
      {
        success: true,
        message: `Failed jobs for '${queue}' queue retrieved successfully!`,
        data: result.jobs,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: error.issues.map((err) => ({ field: err.path.join("."), message: err.message })),
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }

    console.error("ADMIN GET FAILED QUEUE JOBS CRITICAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}