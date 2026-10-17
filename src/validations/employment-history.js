import { EmploymentType } from "@/generated/prisma/client";
import { InviteStatus } from "@/generated/prisma/client";
import { Type } from "@/generated/prisma/client";
import { LeaveStatus } from "@/generated/prisma/client";
import { Currency } from "@/generated/prisma/client";
import z from "zod";

export const employmentHistorySchema = z.object({
    roleTitle: z.string().trim(),
    description: z.string().trim().optional(),
    salary: z.number().optional(),
    currency: z.enum(Currency).optional(),
    employmentType: z.enum(EmploymentType),
})

export const employmentEvent = z.object({
    reason: z.string().trim().optional().nullable(),
    letterUrl: z.string().trim().optional().nullable(),
    status: z.enum(LeaveStatus).optional().nullable()
})

export const employmentEventStatus = z.object({
    status: z.enum(LeaveStatus)
})

export const invitationSchema = z.object({
    email: z.email(),
    roleTitle: z.string().trim(),
    description: z.string().trim().optional(),
    salary: z.number().optional(),
    currency: z.enum(Currency).optional(),
    employmentType: z.enum(EmploymentType),
})

export const invitationRecievedSchema = z.object({
    status: z.enum(InviteStatus)
})
