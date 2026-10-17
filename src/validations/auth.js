import z from "zod";

export const register = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(['DEVELOPER', 'RECRUITER'])
});

export const login = z.object({
    email: z.email(),
    password: z.string().min(8)
});

export const emailVerify = z.object({
    email: z.email(),
    otp: z.string().length(6)
});

export const resendEmail = z.object({
    email: z.email(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Password must be eight character long!"),
    newPassword: z.string().min(8, "Password must be eight character long!"),
    confirmPassword: z.string().min(8, "Password must be eight character long!"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  });

  export const updateAccountSchema = z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name cannot exceed 80 characters"),
  });