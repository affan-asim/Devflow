import { ReferenceType } from "@/generated/prisma/client";
import { ActionType } from "@/generated/prisma/client";
import z from "zod";

export const notificationSchema = z.object({
    id: z.string().trim().optional(),
    message: z.string().trim(),
    recipientId: z.string().trim(),
    referenceId: z.string().trim(),
    actionType: z.enum(ActionType),
    referenceType: z.enum(ReferenceType),
});
