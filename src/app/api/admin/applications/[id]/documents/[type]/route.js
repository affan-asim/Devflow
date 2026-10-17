import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import prisma from "@/utils/prisma";
import { generatePresignedGetUrl } from "@/services/presignedUrl/presignedUrl";

const DOCUMENT_FIELDS = {
  resume: "resume",
  "cover-letter": "coverLetter",
};

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== ROLE.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Access restricted to administrators only.",
        },
        { status: 403 }
      );
    }

    const { id, type } = await params;
    const documentField = DOCUMENT_FIELDS[type];

    if (!documentField) {
      return NextResponse.json(
        { success: false, error: "Unsupported application document type." },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id },
      select: {
        [documentField]: {
          select: { key: true },
        },
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    const document = application[documentField];
    if (!document?.key) {
      throw new AppError("This application has no such document", 404);
    }

    const signedUrl = await generatePresignedGetUrl(document.key);
    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("ADMIN APPLICATION DOCUMENT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
