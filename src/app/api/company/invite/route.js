import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { invitationSchema } from "@/validations/employment-history";
import { createInvitation, getCompanyRecruiterInvitations } from "@/services/recruiterHistory/recruiterHistotryService";

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    if (userRole !== ROLE.RECRUITER) {
      return NextResponse.json({ success: false, error: "Forbidden. Only recruiters can view company invitations." }, { status: 403 });
    }

    const data = await getCompanyRecruiterInvitations(userId, req.nextUrl.searchParams);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    console.error("GET COMPANY INVITATIONS ERROR:", error);
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
          error: "Forbidden. Only owner can send invitation email." 
        }, { status: 403 });
      };
  
      const rawBody = await req.text();
      const body = rawBody ? JSON.parse(rawBody) : {};
  
      const validatedData = invitationSchema.parse(body);
  
      const invitation = await createInvitation(userId, validatedData);
  
      return NextResponse.json({
        success: true,
        message: "Invitation created successfully!",
        data: invitation
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
  
      console.error("INVITATION CRITICAL ERROR:", error);
      return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
  };
