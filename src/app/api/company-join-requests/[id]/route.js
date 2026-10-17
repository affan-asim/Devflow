import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { updateCompanyJoinRequestSchema } from "@/validations/company-join-requests";
import { getCompanyJoinRequestDetail, updateCompanyJoinRequest } from "@/services/company/companyJoinRequestService";

const errorResponse = (error, label) => {
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: "Validation Error", details: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) }, { status: 400 });
  if (error instanceof AppError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
  console.error(label, error);
  return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
};

export async function GET(req, { params }) {
  try {
    if (req.headers.get("x-user-role") !== ROLE.RECRUITER) return NextResponse.json({ success: false, error: "Forbidden. Only recruiters can view company join requests." }, { status: 403 });
    const { id } = await params;
    const data = await getCompanyJoinRequestDetail(req.headers.get("x-user-id"), id);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) { return errorResponse(error, "GET COMPANY JOIN REQUEST DETAIL ERROR:"); }
}

export async function PATCH(req, { params }) {
  try {
    if (req.headers.get("x-user-role") !== ROLE.RECRUITER) return NextResponse.json({ success: false, error: "Forbidden. Only recruiters can update their join requests." }, { status: 403 });
    const { id } = await params;
    const data = updateCompanyJoinRequestSchema.parse(await req.json());
    const request = await updateCompanyJoinRequest(req.headers.get("x-user-id"), id, data);
    return NextResponse.json({ success: true, message: "Company join request updated successfully.", data: request }, { status: 200 });
  } catch (error) { return errorResponse(error, "UPDATE COMPANY JOIN REQUEST ERROR:"); }
}
