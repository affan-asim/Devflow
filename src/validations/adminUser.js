import { z } from "zod";
import { ROLE } from "@/generated/prisma";

export const getUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum(ROLE).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  isVerified: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "isActive status is required",
    invalid_type_error: "isActive must be a boolean",
  }),
});