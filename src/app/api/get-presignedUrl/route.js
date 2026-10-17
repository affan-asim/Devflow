import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { fileSchema } from "@/validations/presignedUrl";
import { getFileUrl, getPutUrl } from "@/services/presignedUrl/presignedUrl";
import { supabaseAdmin } from "@/utils/supabaseAdmin";

export async function GET(req) {
    try {
        const userRole = req.headers.get("x-user-role");
        const userId = req.headers.get("x-user-id");
        const searchParams = req.nextUrl.searchParams

        const key = searchParams.get("key");
        const url = await getFileUrl(userId, userRole, key);

        return NextResponse.json({
            success: true,
            data: url
        }, { status: 200 });

    } catch (error) {
        console.error("GET PRESIGNED URL ERROR:", error);

        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};

export async function POST(req) {
    try {
        const userId = req.headers.get("x-user-id");

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = fileSchema.parse(body);

        const data = await getPutUrl(userId, validatedData);

        return NextResponse.json({
            success: true,
            data
        }, { status: 200 });

    } catch (error) {
        console.error("POST PRESIGNED URL ERROR:", error);
        console.error("SUPABASE STORAGE ERROR");
        console.error("message:", error.message);
        console.error("name:", error.name);
        console.error("cause:", error.cause);
        console.error("stack:", error.stack);

        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};
