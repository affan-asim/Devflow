import { Currency } from "@/generated/prisma/client";
import { EmploymentType } from "@/generated/prisma/client";
import { STATUS } from "@/generated/prisma/client";
import z, { string } from "zod";

export const applicationSchema = z.object({
    jobId: z.string().trim(),
    resumeTempKey: z.string().min(1, "Please add valid tempKey").optional().nullable(),
    coverLetterTempKey: z.string().min(1, "Please add valid tempKey").optional().nullable(),
});

export const updateApplicationSchema = z.object({
    resumeTempKey: z.string().min(1, "Please add valid tempKey").optional().nullable(),
coverLetterTempKey: z.string().min(1, "Please add valid tempKey").optional().nullable(),
});

export const updateApplicationSchemaStatus = z.object({
    status: z.enum(STATUS, {
        error: () => ({ message: "Invalid Status" })
    }),
    roleTitle: z.string().trim().optional(),
    description: z.string().trim().optional(),
    salary: z.number().optional(),
    currency: z.enum(Currency).optional(),
    employmentType: z.enum(EmploymentType).optional(),
    startDate: z.coerce.date().optional(),
    rejectionReason: z.string().min(5, "Provide proper reason").optional()
}).superRefine((data, ctx) => {
    if (data.status === "ACCEPTED") {
        if (!data.roleTitle) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Role title is required when status is accepted",
                path: ["roleTitle"]
            });
        }
        if (!data.employmentType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Employment type is required when status is accepted",
                path: ["employmentType"]
            });
        }
        if (!data.startDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Start date is required when status is accepted",
                path: ["startDate"]
            });
        }
    }
});

export const getAdminApplicationsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(STATUS).optional(),
  jobId: z.uuid().optional(),
  companyId: z.uuid().optional(),
  recruiterId: z.uuid().optional(),
  developerId: z.uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
