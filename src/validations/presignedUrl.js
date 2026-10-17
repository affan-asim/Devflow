import { FileType } from '@/generated/prisma/client';
import z from 'zod'

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
];

export const fileSchema = z.object({
    filename: z.string().min(1).max(255)
        .refine((n) => !n.includes("..") && !n.includes("/"), "Invalid filename"),
    contentType: z.enum(ALLOWED_TYPES, {
        errorMap: () => ({ message: `Must be one of: ${ALLOWED_TYPES.join(", ")}` }),
    }),
    type: z.enum(FileType, {
        errorMap: () => ({ message: `Must be one of: ${FileType.join(", ")}` }),
    }),
});   