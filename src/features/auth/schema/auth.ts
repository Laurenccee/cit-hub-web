import * as z from 'zod/mini';

export const SignInSchema = z.object({
    email: z.email('Please enter a valid email'),
    password: z.string().check(z.minLength(6, 'Password must be at least 6 characters')),
});

export const ForgetPasswordSchema = z.object({
    email: z
        .string()
        .check(z.minLength(1, 'Email is required'), z.regex(z.regexes.email, 'Invalid email address')),
});

const passwordRule = z
    .string()
    .check(
        z.minLength(8, 'Password must be at least 8 characters'),
        z.regex(/[A-Z]/, 'Must include an uppercase letter'),
        z.regex(/[a-z]/, 'Must include a lowercase letter'),
        z.regex(/[0-9]/, 'Must include a number'),
    );

export const ResetPasswordSchema = z.object({
    password: passwordRule,
});

export type SignInFormData = z.infer<typeof SignInSchema>;
export type ForgetPasswordData = z.infer<typeof ForgetPasswordSchema>;

export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
