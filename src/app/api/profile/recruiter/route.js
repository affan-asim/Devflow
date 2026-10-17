import { NextResponse } from "next/server";
import { recuiterProfile, updateRecuiterProfileSchema } from "@/validations/profile";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { createRecuiterProfile, getRecuiterProfile, updateRecuiterProfile } from "@/services/profile/recuiterService";
import { ROLE } from "@/generated/prisma/client";

export async function GET(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const profile = await getRecuiterProfile(userId);

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
        console.error("GET RECUITER PROFILE ERROR:", error);
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
        error: "Forbidden. Only recuiters can create recuiter profiles." 
      }, { status: 403 });
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const validatedData = recuiterProfile.parse(body);

    const profile = await createRecuiterProfile(userId, validatedData);

    return NextResponse.json({
      success: true,
      message: "Profile created successfully!",
      data: profile
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

    console.error("RECUITER PROFILE CRITICAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};

export async function PATCH(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');

        if (userRole !== ROLE.RECRUITER) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only recuiters can create recuiter profiles."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const validatedData = updateRecuiterProfileSchema.parse(body);

        const updatedProfile = await updateRecuiterProfile(userId, validatedData);

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully!",
            data: updatedProfile
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
        console.error("RECUITER PROFILE UPDATE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};