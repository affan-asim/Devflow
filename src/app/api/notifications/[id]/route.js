import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { getNotificationDetail } from "@/services/notifications/notificationService";

export async function GET(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const { id } = await params;

        const notifications = await getNotificationDetail(id, userId);

        return NextResponse.json({
            success: true,
            data: notifications
        }, { status: 200 });

    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);

        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};  