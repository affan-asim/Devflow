import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { getQueuesSummary } from "@/services/admin/queueService";

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

    const summary = await getQueuesSummary();

    return NextResponse.json(
      {
        success: true,
        message: "Queue metrics fetched successfully!",
        data: summary,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }

    console.error("ADMIN GET QUEUES SUMMARY CRITICAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}