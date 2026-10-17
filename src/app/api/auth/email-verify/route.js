import { VerificationType } from "@/generated/prisma";
import { registerUser } from "@/services/auth/authService";
import { emailService } from "@/services/auth/emailService";
import { AppError } from "@/utils/AppError";
import { emailVerify } from "@/validations/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req) {
    try {
        const body = await req.json();

        const validateData = emailVerify.parse(body);
 
        const result = await emailService(validateData, VerificationType.EMAIL_VERIFICATION)

        return NextResponse.json({
            success: true,
            message: result.message
          }, { status: 200 });

    } catch (error) {

        if (error instanceof ZodError) {
            return NextResponse.json({
                error: 'Validation Error',
                details: error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                })),
                success: false
            }, { status: 400 })
        }

        if (error instanceof AppError) {
            return NextResponse.json({
                error: error.message,
                success: false
            }, { status: error.statusCode })
        }

        console.error("CRITICAL ERROR", error);

        return NextResponse.json({
            success: false,
            error: "Server Error"
        }, { status: 500 });
    }
};