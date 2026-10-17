import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ROLE } from "@/generated/prisma/client";
import { recruiterDashboard } from "@/services/profile/recuiterService";

export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type")

    if (!type) {
      return NextResponse.json({
        success: false,
        error: "Provide type parameter in url."
      }, { status: 400 });
    }

    if (userRole !== ROLE.RECRUITER) {
      return NextResponse.json({
        success: false,
        error: "Forbidden. Only recuiter can see their dashboard."
      }, { status: 403 });
    }

    const result = await recruiterDashboard(userId, type);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET RECRUITER DASHBOARD ERROR:", error);
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}