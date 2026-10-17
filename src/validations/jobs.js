import { ExperienceLevel } from "@/generated/prisma/client";
import { JobStatus } from "@/generated/prisma/client";
import { Currency } from "@/generated/prisma/client";
import { LOCATION } from "@/generated/prisma/client";
import { EmploymentType } from "@/generated/prisma/client";
import z from "zod";
import { skillSchema } from "./profile";

export const jobSchema = z.object({
  title: z.string().trim().min(3, "Provide atleast 3 Digit long name!"),
  description: z.string().trim().max(850, "Provide description within 850 character long"),
  skills: z.array(skillSchema).min(1, "Please add at least one skill"),
  minSalary: z.number(),
  maxSalary: z.number(),

  employmentType: z.enum(EmploymentType, {
    error: () => ({ message: "Invalid employment type" })
  }),
  experienceLevel: z.enum(ExperienceLevel, {
    error: () => ({ message: "Invalid experience level" })
  }),
  locationPreference: z.enum(LOCATION, {
    error: () => ({ message: "Invalid location preference" })
  }),
  status: z.enum(JobStatus, {
    error: () => ({ message: "Invalid status" })
  }),
  currency: z.enum(Currency, {
    error: () => ({ message: "Invalid currency" })
  }),

  deadline: z.coerce.date({
    invalid_type_error: "Invalid date format"
  }),
})

const allowedFields = Object.keys(jobSchema.shape).join(', ');

export const updateJobSchemaSchema = jobSchema
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: `Request body cannot be empty. Please provide at least one of these fields to update: [${allowedFields}]`,
      path: [],
    }
  );

export const updateStatusSchema = z.object({
  status: z.enum(JobStatus, {
    error: () => ({ message: "Invalid status" })
  }),
})

export const updateJobFeaturedSchema = z.object({
  isFeatured: z.boolean({
    required_error: "isFeatured boolean is required",
    invalid_type_error: "isFeatured must be a boolean",
  }),
});