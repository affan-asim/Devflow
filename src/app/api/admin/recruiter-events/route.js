import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { getRecruiterEventsList } from "@/services/admin/eventService";
import { getRecruiterEventsQuerySchema } from "@/validations/adminEvents";

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== ROLE.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden. Access restricted to administrators only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getRecruiterEventsQuerySchema.parse(queryParams);
    const result = await getRecruiterEventsList(validatedQuery);

    return NextResponse.json(
      {
        success: true,
        message: "Recruiter events retrieved successfully!",
        data: result,
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

    console.error("ADMIN GET RECRUITER EVENTS CRITICAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}