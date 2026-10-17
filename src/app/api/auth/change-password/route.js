import { changePassword } from "@/services/auth/chanagePassword";
import { AppError } from "@/utils/AppError";
import { changePasswordSchema } from "@/validations/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function PATCH(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const body = await req.json();

    const validateData = changePasswordSchema.parse(body);

    const result = await changePassword(userId, validateData);

    const response = NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
        data: result,
      },
      { status: 200 }
    );

    response.cookies.delete("access-token");
    response.cookies.delete("refresh-token");

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
          success: false,
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          success: false,
        },
        { status: error.statusCode }
      );
    }

    console.error("CRITICAL ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server Error",
      },
      { status: 500 }
    );
  }
}