import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { getCompany, updateCompanyStatus } from "@/services/company/companyService";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        // The role is added by the auth middleware. Never trust a client query
        // parameter to enable the expanded administrative response.
        const isAdmin = req.headers.get("x-user-role") === ROLE.ADMIN;
        const company = await getCompany(id, { isAdmin });

        if (!company) {
            return NextResponse.json({ 
                success: false, 
                error: "Company not found. Please create your company." 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: company
        }, { status: 200 });

    } catch (error) {
        console.error("GET COMPANY PROFILE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');

        const { id } = await params;

        if (userRole !== ROLE.ADMIN) {
            return NextResponse.json({
                success: false,
                error: "Forbidden. Only admin can change company status verification."
            }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};

        const company = await updateCompanyStatus(id, body);

        return NextResponse.json({
            success: true,
            message: "Company updated successfully!",
            data: company
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
        console.error("COMAPNY UPDATE ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};
