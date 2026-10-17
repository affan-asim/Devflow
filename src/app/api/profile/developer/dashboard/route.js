import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { developerDashboard } from "@/services/profile/developerService";

export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (userRole !== 'DEVELOPER') {
      return NextResponse.json({
        success: false,
        error: "Forbidden. Only developers can see developer dashboard."
      }, { status: 403 });
    }

    const result = await developerDashboard(userId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET DEVELOPERS DASHBOARD ERROR:", error);
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}