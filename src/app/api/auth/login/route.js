import { loginUser, createRefreshToken } from "@/services/auth/loginService";
import { AppError } from "@/utils/AppError";
import { generateToken } from "@/utils/auth";
import { login } from "@/validations/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req) {
    try {
        const body = await req.json();

        const validatedData = login.parse(body);

        const user = await loginUser(validatedData);

        const accessToken = generateToken(user.id, user.role, 'access', user.email);
        const refreshToken = generateToken(user.id, user.role, 'refresh', user.email);
        
        await createRefreshToken(user.id, refreshToken, req);
        
        const response = NextResponse.json(
            { message: "User login successfully!", success: true, role: user.role },
            { status: 200 }
        );
        
        response.cookies.set('access-token', accessToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 1,
            secure: process.env.NODE_ENV === "production"
        });

        response.cookies.set('refresh-token', refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            secure: process.env.NODE_ENV === "production"
        });

        return response;

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({
                error: 'Validation Error',
                details: error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                })),
                success: false
            }, { status: 400 });
        }

        if (error instanceof AppError) {
            return NextResponse.json({
                error: error.message,
                success: false
            }, { status: error.statusCode });
        }

        console.error("CRITICAL SERVER ERROR:", error);
        return NextResponse.json({
            success: false,
            error: "Internal Server Error"
        }, { status: 500 });
    }
}
