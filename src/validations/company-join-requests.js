import { CompanyJoinRequestStatus, Currency, EmploymentType } from "@/generated/prisma/client";
import z from "zod";

export const createCompanyJoinRequestSchema = z.object({
  companyId: z.string().uuid(),
  message: z.string().trim().max(2000).optional().nullable(),
}).strict();

export const updateCompanyJoinRequestSchema = z.object({
  message: z.string().trim().max(2000).optional().nullable(),
}).strict().refine((data) => Object.hasOwn(data, "message"), {
  message: "Provide a message to update.",
});

export const companyJoinRequestStatusSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal(CompanyJoinRequestStatus.REJECTED),
  }).strict(),
  z.object({
    status: z.literal(CompanyJoinRequestStatus.ACCEPTED),
    roleTitle: z.string().trim().min(1).max(150),
    employmentType: z.enum(EmploymentType),
    salary: z.number().nonnegative().optional().nullable(),
    currency: z.enum(Currency).optional().nullable(),
    description: z.string().trim().max(5000).optional().nullable(),
    startDate: z.coerce.date().optional(),
  }).strict(),
]);
