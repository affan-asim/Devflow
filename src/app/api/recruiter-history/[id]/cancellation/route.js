import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { employmentEvent } from "@/validations/employment-history";
import { updateEmploymentEvent, updateRecruiterEmploymentEvent } from "@/services/employmentHistory/employmentEventService";

export async function POST(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');
        const { id } = await params;

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({ 
              success: false, 
              error: "Forbidden. Only recruiter can resgin/terminate." 
            }, { status: 403 });
          }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = employmentEvent.parse(body);

        const event = await updateRecruiterEmploymentEvent(userId, validatedData, id);

        return NextResponse.json({
            success: true,
            message: "Employment Event updated successfully!",
            data: event
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