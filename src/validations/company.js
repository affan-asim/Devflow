import { Country } from "@/generated/prisma/client";
import { EmploymentType } from "@/generated/prisma/client";
import { Currency } from "@/generated/prisma/client";
import { Industry } from "@/generated/prisma/client";
import z from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(1, "Provide String name"),
  logo: z.string().trim().optional().nullable(),
  websiteUrl: z.url("Please provide correct company website url"),
  industry: z
  .string()
  .trim()
  .transform((val) => val.toUpperCase())
  .pipe(z.enum(Industry)),

country: z
  .string()
  .trim()
  .transform((val) => val.toUpperCase())
  .pipe(z.enum(Country)),

  roleTitle: z.string().trim(),
  description: z.string().trim().optional(),
  salary: z.number().optional(),
  currency: z.enum(Currency).optional(),
  employmentType: z.enum(EmploymentType),
})

const allowedFields = Object.keys(companySchema.shape).join(', ');

export const updateCompanySchema = companySchema
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: `Request body cannot be empty. Please provide at least one of these fields to update: [${allowedFields}]`,
      path: [],
    }
  );


export const verifyCompanySchema = z.object({
  isVerified: z.boolean({
    required_error: "isVerified status is required",
    invalid_type_error: "isVerified must be a boolean",
  }),
});