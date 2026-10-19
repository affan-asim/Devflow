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
        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};
