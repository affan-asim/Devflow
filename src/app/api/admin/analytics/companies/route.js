import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { getCompanyAnalytics } from "@/services/admin/analyticsService";
import { analyticsDateRangeSchema } from "@/validations/adminSystem";

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
    const dateQuery = analyticsDateRangeSchema.parse(Object.fromEntries(searchParams.entries()));
    const analytics = await getCompanyAnalytics(dateQuery);

    return NextResponse.json({ success: true, data: analytics }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid date format. Use ISO format or YYYY-MM-DD." },
        { status: 400 }
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    console.error("ADMIN ANALYTICS COMPANIES ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}