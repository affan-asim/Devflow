import { NextResponse } from "next/server";
import { developerProfile, updateDeveloperProfileSchema } from "@/validations/profile";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { createDeveloperProfile, getDeveloperProfile, updateDeveloperProfile } from "@/services/profile/developerService";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        
        const profile = await getDeveloperProfile(id);

        if (!profile) {
            return NextResponse.json({
                success: false,
                error: "Profile not found. Please complete your onboarding."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: profile
        }, { status: 200 });

    } catch (error) {
        console.error("GET DEVELOPER PROFILE ERROR:", error);
        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
          }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}