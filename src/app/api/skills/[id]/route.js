import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { createSkill, getSkill, getSkills, updateSkill } from "@/services/skills/skills";
import { createSkillSchema, updateSkillSchema } from "@/validations/skills";

export async function GET(req, { params }) {
    try {

        const { id } = await params;
        const skill = await getSkill(id);

        return NextResponse.json({
            success: true,
            data: skill
        }, { status: 200 });

    } catch (error) {
        console.error("GET SKILL ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        if (req.headers.get("x-user-role") !== ROLE.ADMIN) {
            return NextResponse.json({ success: false, error: "Forbidden. Only admins can update skills." }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};
        const skill = await updateSkill(updateSkillSchema.parse(body), id);

        return NextResponse.json({
            success: true,
            message: "Skill updated successfully!",
            data: skill
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

        console.error("CREATE SKILL ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};