import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma";
import { getEmploymentEventFilterOptions } from "@/services/admin/eventService";
import { employmentEventOptionsQuerySchema } from "@/validations/adminEvents";

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== ROLE.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden. Access restricted to administrators only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = employmentEventOptionsQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );
    const result = await getEmploymentEventFilterOptions(query);

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid filter options query." },
        { status: 400 }
      );
    }

    console.error("ADMIN GET EMPLOYMENT EVENT FILTER OPTIONS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
