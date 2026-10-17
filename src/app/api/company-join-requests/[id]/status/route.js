import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { companyJoinRequestStatusSchema } from "@/validations/company-join-requests";
import { updateCompanyJoinRequestStatus } from "@/services/company/companyJoinRequestService";

export async function PATCH(req, { params }) {
  try {
    if (req.headers.get("x-user-role") !== ROLE.RECRUITER) return NextResponse.json({ success: false, error: "Forbidden. Only company owners can decide join requests." }, { status: 403 });
    const { id } = await params;
    const data = companyJoinRequestStatusSchema.parse(await req.json());
    const request = await updateCompanyJoinRequestStatus(req.headers.get("x-user-id"), id, data);
    return NextResponse.json({ success: true, message: `Company join request ${data.status.toLowerCase()} successfully.`, data: request }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ success: false, error: "Validation Error", details: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) }, { status: 400 });
    if (error instanceof AppError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    console.error("UPDATE COMPANY JOIN REQUEST STATUS ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
