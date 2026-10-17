import { NextResponse } from "next/server";
import { developerProfile, updateDeveloperProfileSchema } from "@/validations/profile";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { createDeveloperProfile, getDeveloperProfile, getDevelopers, updateDeveloperProfile } from "@/services/profile/developerService";

export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);

    const result = await getDevelopers(searchParams, userId);

    return NextResponse.json(
      {
        success: true,
        data: result.developers,
        metadata: result.metadata,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET DEVELOPERS LIST ERROR:", error);
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (userRole !== 'DEVELOPER') {
      return NextResponse.json({
        success: false,
        error: "Forbidden. Only developers can create developer profiles."
      }, { status: 403 });
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const validatedData = developerProfile.parse(body);

    const profile = await createDeveloperProfile(userId, validatedData);

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

    console.error("DEVELOPER PROFILE CRITICAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};

export async function PATCH(req) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (userRole !== 'DEVELOPER') {
      return NextResponse.json({ success: false, error: "Forbidden. Only developers can update this profile." }, { status: 403 });
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const validatedData = updateDeveloperProfileSchema.parse(body);

    const updatedProfile = await updateDeveloperProfile(userId, validatedData);

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
    console.error("DEVELOPER PROFILE UPDATE ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};