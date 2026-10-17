import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { createCompany, getCompanies, getCompany, updateCompany } from "@/services/company/companyService";
import { companySchema, updateCompanySchema } from "@/validations/company";

export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const searchParams = req.nextUrl.searchParams;
    const searchParamsObject = Object.fromEntries(searchParams.entries());

    const company = await getCompanies(searchParams, searchParamsObject);

    if (!company) {
      return NextResponse.json({
        success: false,
        error: "Company not found. Please create your company."
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: company
    }, { status: 200 });

  } catch (error) {
    console.error("GET COMPANY PROFILE ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (userRole !== ROLE.RECRUITER) {
      return NextResponse.json({
        success: false,
        error: "Forbidden. Only recuiters can create companies."
      }, { status: 403 });
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const validatedData = companySchema.parse(body);

    const company = await createCompany(userId, validatedData);

    return NextResponse.json({
      success: true,
      message: "Company created successfully!",
      data: company
    }, { status: 201 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation Error",
        details: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
      }, { status: 400 });
    }

    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }

    console.error("COMAPNY CRITICAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};

export async function PATCH(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (userRole !== ROLE.RECRUITER) {
      return NextResponse.json({
        success: false,
        error: "Forbidden. Only company owner can update company."
      }, { status: 403 });
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const validatedData = updateCompanySchema.parse(body);

    const company = await updateCompany(userId, validatedData);

    return NextResponse.json({
      success: true,
      message: "Company updated successfully!",
      data: company
    }, { status: 200 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation Error",
        details: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
      }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    console.error("COMAPNY UPDATE ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};