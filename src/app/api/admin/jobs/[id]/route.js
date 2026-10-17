import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { getJob, deleteJobByAdmin, getAdminJobById } from "@/services/jobs/jobService";

export async function GET(req, { params }) {
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

    const data = await getAdminJobById(id);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("ADMIN GET JOB BY ID CRITICAL ERROR:", error);
    const status = error.statusCode || error.status || 500;
    return NextResponse.json(
      { success: false, error: status === 500 ? "Failed to fetch job details" : error.message },
      { status }
    );
  }
}

export async function DELETE(req, { params }) {
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

    const data = await deleteJobByAdmin(id);

    return NextResponse.json({ success: true, data });

  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("ADMIN DELETE JOB CRITICAL ERROR:", error);
    const status = error.statusCode || error.status || 500;

    return NextResponse.json(
      {
        success: false,
        error: status === 500 ? "Failed to delete job" : error.message,
      },
      { status }
    );
  }
}