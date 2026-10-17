
import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { getSystemHealthMetrics } from "@/services/admin/systemService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== ROLE.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Access restricted to administrators only.",
        },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const healthMetrics = await getSystemHealthMetrics();

    return NextResponse.json(
      {
        success: true,
        data: healthMetrics,
      },
      {
        status: healthMetrics.status === "HEALTHY" ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        {
          status: error.statusCode,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    console.error("ADMIN SYSTEM HEALTH CHECK CRITICAL ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to retrieve system health." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}