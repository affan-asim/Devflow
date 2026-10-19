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

        if (error instanceof AppError) {
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};