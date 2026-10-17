import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { getUser } from "@/services/me/userService";
import { updateAccount } from "@/services/auth/accountSettings";
import { updateAccountSchema } from "@/validations/auth";

export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json({
            success: false,
            error: "userId not found. Please create an account first."
          }, { status: 403 });
    }

    const user = await getUser(userId);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "user not found. Please create an account first."
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    }, { status: 200 });

  } catch (error) {
    console.error("GET USER ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json({
            success: false,
            error: "userId not found. Please create an account first."
          }, { status: 403 });
    }
    const body = await req.json();

    const validatedData = updateAccountSchema.parse(body);

    const user = await updateAccount(userId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Account updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
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