import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { getRecruiterEventById } from "@/services/admin/eventService";

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

    const { id } = await params;
    const event = await getRecruiterEventById(id);

    return NextResponse.json(
      { success: true, message: "Recruiter event details retrieved successfully!", data: event },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }

    console.error("ADMIN GET RECRUITER EVENT BY ID CRITICAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}