import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { deleteEmailLogByAdmin } from "@/services/admin/systemService";

export async function DELETE(req, { params }) {
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
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Email log ID is required" },
        { status: 400 }
      );
    }

    const data = await deleteEmailLogByAdmin(id);

    return NextResponse.json(
      { success: true, message: "Email log deleted successfully!", data },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("ADMIN DELETE EMAIL LOG CRITICAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
