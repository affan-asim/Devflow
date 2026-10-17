import { z } from "zod";
import { FileStatus, FileType } from "@/generated/prisma";

export const getAdminFilesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(FileStatus).optional(),
  type: z.nativeEnum(FileType).optional(),
  userId: z.string().uuid().optional().or(z.literal("")),
  sortBy: z.enum(["createdAt", "status", "type"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const getAdminFileOptionsQuerySchema = z.object({
  kind: z.enum(["users"]),
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});