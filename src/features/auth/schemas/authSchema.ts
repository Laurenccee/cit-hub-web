import { z } from 'zod';

export const SignInSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const ForgetPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const passwordRule = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number');

export const ResetPasswordSchema = z.object({
    password: passwordRule,
});

export type SignInFormData = z.infer<typeof SignInSchema>;
export type ForgetPasswordData = z.infer<typeof ForgetPasswordSchema>;

export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
