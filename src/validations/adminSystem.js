import { z } from "zod";
import { EmailLogStatus, EmailType } from "@/generated/prisma";

export const getEmailLogsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(EmailLogStatus).optional(),
  type: z.enum(EmailType).optional(),
  email: z.string().optional(),
  sortBy: z.enum(["createdAt", "status", "type"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const getFailedJobsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const analyticsDateRangeSchema = z.object({
  from: z.iso.datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  to: z.iso.datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});