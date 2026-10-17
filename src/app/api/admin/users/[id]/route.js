import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { getUserByIdDetails } from "@/services/me/userService";

export async function GET(req, { params }) {
  try {
    const userIdHeader = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userIdHeader || userRole !== ROLE.ADMIN) {
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
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const userDetails = await getUserByIdDetails(id);

    return NextResponse.json(
      {
        success: true,
        message: "User details retrieved successfully!",
        data: userDetails,
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

    console.error("ADMIN GET USER BY ID CRITICAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
