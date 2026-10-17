import { registerUser } from "@/services/auth/authService";
import { AppError } from "@/utils/AppError";
import { register } from "@/validations/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.name || !body.email || !body.password || !body.role) {
            return NextResponse.json({ message: "Name, email, password, role are requied!", success: false }, { status: 400 })
        }

        const validateData = register.parse(body);

        const newUser = await registerUser(validateData)

        return NextResponse.json({ message: "User Created Successfully!", success: true, newUser }, { status: 201 })

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