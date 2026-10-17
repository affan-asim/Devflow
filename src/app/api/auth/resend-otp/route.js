import { VerificationType } from "@/generated/prisma";
import { registerUser } from "@/services/auth/authService";
import { emailService, resendOtp } from "@/services/auth/emailService";
import { AppError } from "@/utils/AppError";
import { resendEmail } from "@/validations/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req) {
    try {
        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validateData = resendEmail.parse(body);
 
        const result = await resendOtp(validateData)

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