import { SkillCategory } from "@/generated/prisma";
import z from "zod";

export const skillSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1).transform(v => v.toUpperCase()).pipe(z.enum(SkillCategory))
})

export const developerProfile = z.object({
  yearsOfExp: z.number(),
  tempKey: z.string().min(1, "Please add valid tempKey").optional().nullable(),
  bio: z.string().min(1, 'Bio must be at least 10 characters long').max(500),
  skills: z.array(skillSchema).min(1, "Please add at least one skill"),
  githubUrl: z.url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolioUrl: z.url('Invalid Portfolio Url URL').optional().or(z.literal('')),
  locationPreference: z.enum(['REMOTE', 'ONSITE', 'HYBRID'], {
    error: () => ({ message: 'Invalid location preference' })
  })
})

const allowedFields = Object.keys(developerProfile.shape).join(', ');

export const updateDeveloperProfileSchema = developerProfile
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: `Request body cannot be empty. Please provide at least one of these fields to update: [${allowedFields}]`, 
      path: [], 
    }
);

export const recuiterProfile = z.object({
  yearsOfExp: z.number().optional(),
  bio: z.string().min(1, 'Bio must be at least 10 characters long').max(500).optional(),
  githubUrl: z.url('Invalid GitHub URL').nullable().or(z.literal('')),
  portfolioUrl: z.url('Invalid Portfolio Url URL').nullable().or(z.literal('')),
  locationPreference: z.enum(['REMOTE', 'ONSITE', 'HYBRID'], {
    error: () => ({ message: 'Invalid location preference' })
  }),
  jobTitle: z.string().trim().optional(),
  description: z.string().trim().max(700).optional(),
});

const allowedFieldRecuiter = Object.keys(recuiterProfile.shape).join(', ');

export const updateRecuiterProfileSchema = recuiterProfile
  .partial()
  .extend({
    tempKey: z.string().min(1, "Please add valid tempKey").optional().nullable(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: `Request body cannot be empty. Please provide at least one of these fields to update: [${allowedFieldRecuiter}]`, 
      path: [], 
    }
);
