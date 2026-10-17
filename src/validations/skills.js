import { SkillCategory } from "@/generated/prisma/client";
import z from "zod";

const baseSkillSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required.").max(100).transform((value) => value.toUpperCase()),
  category: z.enum(SkillCategory, { error: () => ({ message: "Invalid skill category." }) }),
}).strip();

export const createSkillSchema = baseSkillSchema;

export const updateSkillSchema = baseSkillSchema.partial();