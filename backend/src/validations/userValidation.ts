// src/validation/userValidation.ts
import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters long")
            .max(50, "Name too long"),
        email: z
            .string()
            .email("Invalid email address")
            .regex(/\.edu$/, "Email must be a college email (.edu)"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters long")
            .max(100, "Password too long"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
    }),
});

export const verifyEmailSchema = z.object({
    params: z.object({
        token: z.string().min(10, "Invalid verification token"),
    }),
});
