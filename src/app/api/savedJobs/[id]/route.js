import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import {
  getSavedJobById,
  deleteSavedJob,
} from "@/services/jobs/savedJobsService";

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (userRole !== ROLE.DEVELOPER) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Only developers can view saved job details.",
        },
        { status: 403 }
      );
    }

    const { id: savedJobId } = await params;

    const savedJob = await getSavedJobById(userId, savedJobId);

    return NextResponse.json(
      {
        success: true,
        data: savedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("GET SAVED JOB DETAIL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (userRole !== ROLE.DEVELOPER) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Only developers can delete their saved jobs.",
        },
        { status: 403 }
      );
    }

    const { id: savedJobId } = await params;

    await deleteSavedJob(userId, savedJobId);

    return NextResponse.json(
      {
        success: true,
        message: "Saved job deleted successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("DELETE SAVED JOB ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}