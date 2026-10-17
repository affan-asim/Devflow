import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import {
  deleteFileByAdmin,
  getAdminFileUrl,
} from "@/services/admin/fileService";

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
    const fileUrl = await getAdminFileUrl(id);

    return NextResponse.redirect(fileUrl);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("ADMIN OPEN FILE CRITICAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "File ID is required" },
        { status: 400 }
      );
    }

    await deleteFileByAdmin(id);

    return NextResponse.json(
      {
        success: true,
        message: "File record removed and storage cleanup queued successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("ADMIN DELETE FILE CRITICAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
