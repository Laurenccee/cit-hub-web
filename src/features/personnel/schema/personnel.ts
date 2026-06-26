import { z } from 'zod';

const EducationEntrySchema = z.object({
    degree: z.string().min(2, 'Degree is required'),
    major: z.string().optional(),
    institution: z.string().min(2, 'Institution is required'),
    yearGraduated: z.string().min(4, 'Year graduated must be at least 4 characters').optional(),
    onGoing: z.boolean(),
});

const SocialMediaSchema = z.object({
    facebook: z.string().url('Invalid Facebook URL').or(z.literal('')).optional(),
    twitter: z.string().url('Invalid Twitter URL').or(z.literal('')).optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
    instagram: z.string().url('Invalid Instagram URL').or(z.literal('')).optional(),
});

export const PersonnelSchema = z.object({
    profilePictureUrl: z.string().url('Invalid profile picture URL').optional(),
    employeeId: z.string().min(1, 'Employee ID is required'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    office: z.string().min(2, 'Office is required'),
    rankId: z.string().uuid('Rank is required'),
    designationId: z.string().uuid().nullable().optional(),
    contactNumber: z.string().min(7, 'Contact number must be at least 7 characters').optional(),
    education: z.array(EducationEntrySchema),
    socialMedia: SocialMediaSchema,
});

export const RegisterPersonnelSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

export const UpdatePersonnelSchema = PersonnelSchema.extend({
    id: z.string(),
});

export type RegisterPersonnelData = z.infer<typeof RegisterPersonnelSchema>;
export type PersonnelFormData = z.infer<typeof PersonnelSchema>;
export type UpdatePersonnelFormData = z.infer<typeof UpdatePersonnelSchema>;
