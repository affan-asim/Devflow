import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { verifyCompanySchema } from "@/validations/adminCompany";
import { updateCompanyVerification } from "@/services/company/companyService";

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

    const { id: companyId } = await params;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Company ID is required" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const { isVerified } = verifyCompanySchema.parse(body);

    const company = await updateCompanyVerification(companyId, isVerified);

    return NextResponse.json(
      {
        success: true,
        message: `Company status updated to ${isVerified ? "verified" : "unverified"} successfully!`,
        data: company,
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

    console.error("ADMIN VERIFY COMPANY CRITICAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}