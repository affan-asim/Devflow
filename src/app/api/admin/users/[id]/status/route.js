import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { updateUserStatus } from "@/services/me/userService";
import { updateUserStatusSchema } from "@/validations/adminUser";

export async function PATCH(req, { params }) {
  try {
    const adminId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!adminId || userRole !== ROLE.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Access restricted to administrators only.",
        },
        { status: 403 }
      );
    }

    const { id: targetUserId } = await params;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Target User ID is required" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const { isActive } = updateUserStatusSchema.parse(body);

    const updatedUser = await updateUserStatus(adminId, targetUserId, isActive);

    return NextResponse.json(
      {
        success: true,
        message: `User status updated to ${isActive ? "active" : "inactive"} successfully!`,
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("ADMIN UPDATE USER STATUS CRITICAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}