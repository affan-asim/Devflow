import { z } from "zod";
import { LeaveStatus, Type } from "@/generated/prisma/client";

export const getEmploymentEventsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(LeaveStatus).optional(),
  type: z.nativeEnum(Type).optional(),
  companyId: z.string().uuid().optional().or(z.literal("")),
  developerId: z.string().uuid().optional().or(z.literal("")),
  search: z.string().optional(),
  sortBy: z.enum(["id", "createdAt", "status", "type"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const getRecruiterEventsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(LeaveStatus).optional(),
  type: z.nativeEnum(Type).optional(),
  companyId: z.string().uuid().optional().or(z.literal("")),
  recruiterId: z.string().uuid().optional().or(z.literal("")),
  search: z.string().optional(),
  sortBy: z.enum(["id", "createdAt", "status", "type"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const employmentEventOptionsQuerySchema = z.object({
  kind: z.enum(["companies", "developers"]),
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

export const recruiterEventOptionsQuerySchema = z.object({
  kind: z.enum(["companies", "recruiters"]),
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});
