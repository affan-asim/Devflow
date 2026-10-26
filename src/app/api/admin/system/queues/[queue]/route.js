import { NextResponse } from "next/server";
import { ROLE } from "@/generated/prisma";
import { AppError } from "@/utils/AppError";
import { retryFailedJob, retryAllFailedJobs } from "@/services/admin/queueService";

export async function POST(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== ROLE.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden. Access restricted to administrators only." },
        { status: 403 }
      );
    }

    const { queue } = await params;
    const body = await req.json().catch(() => ({}));

    if (body.jobId) {
      const result = await retryFailedJob(queue, body.jobId);
      return NextResponse.json(
        {
          success: true,
          message: `Job '${body.jobId}' in queue '${queue}' has been scheduled for retry!`,
          data: result,
        },
        { status: 200 }
      );
    }

    const count = body.count || 100;
    const result = await retryAllFailedJobs(queue, count);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully triggered retry for failed jobs in '${queue}' queue!`,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }

    console.error("ADMIN RETRY QUEUE JOBS ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
