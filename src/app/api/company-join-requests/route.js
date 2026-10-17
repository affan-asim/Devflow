import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { createCompanyJoinRequestSchema } from "@/validations/company-join-requests";
import { createCompanyJoinRequest, getCompanyJoinRequests } from "@/services/company/companyJoinRequestService";

const errorResponse = (error, label) => {
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: "Validation Error", details: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) }, { status: 400 });
  if (error instanceof AppError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
  console.error(label, error);
  return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
};

export async function GET(req) {
  try {
    if (req.headers.get("x-user-role") !== ROLE.RECRUITER) return NextResponse.json({ success: false, error: "Forbidden. Only recruiters can view company join requests." }, { status: 403 });
    const data = await getCompanyJoinRequests(req.headers.get("x-user-id"), req.nextUrl.searchParams);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) { return errorResponse(error, "GET COMPANY JOIN REQUESTS ERROR:"); }
}

export async function POST(req) {
  try {
    if (req.headers.get("x-user-role") !== ROLE.RECRUITER) return NextResponse.json({ success: false, error: "Forbidden. Only recruiters can request to join a company." }, { status: 403 });
    const data = createCompanyJoinRequestSchema.parse(await req.json());
    const request = await createCompanyJoinRequest(req.headers.get("x-user-id"), data);
    return NextResponse.json({ success: true, message: "Company join request created successfully.", data: request }, { status: 201 });
  } catch (error) { return errorResponse(error, "CREATE COMPANY JOIN REQUEST ERROR:"); }
}
