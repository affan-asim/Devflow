import { NextResponse } from "next/server";
import { AppError } from "@/utils/AppError";
import { ZodError } from "zod";
import { ROLE } from "@/generated/prisma/client";
import { createSkill, getSkills } from "@/services/skills/skills";
import { createSkillSchema } from "@/validations/skills";

export async function GET(req) {
    try {
        const searchParams = req.nextUrl.searchParams
        const skills = await getSkills(searchParams);

        return NextResponse.json({
            success: true,
            data: skills
        }, { status: 200 });

    } catch (error) {
        console.error("GET skills ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};

export async function POST(req) {
    try {
        if (req.headers.get("x-user-role") !== ROLE.ADMIN) {
            return NextResponse.json({ success: false, error: "Forbidden. Only admins can create skills." }, { status: 403 });
        }

        const rawBody = await req.text();
        const body = rawBody ? JSON.parse(rawBody) : {};
        const skill = await createSkill(createSkillSchema.parse(body));

        return NextResponse.json({
            success: true,
            message: "Skill created successfully!",
            data: skill
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

        console.error("CREATE SKILL ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};