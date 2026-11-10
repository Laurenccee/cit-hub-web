import * as z from 'zod/mini';

const EducationEntrySchema = z.object({
    degree: z.string().check(z.minLength(2, 'Degree is required')),
    major: z.optional(z.string()),
    institution: z.string().check(z.minLength(2, 'Institution is required')),
    yearGraduated: z.optional(
        z.string().check(z.minLength(4, 'Year graduated must be at least 4 characters')),
    ),
    onGoing: z.boolean(),
});

const optionalUrl = (message: string) => z.optional(z.union([z.url(message), z.literal('')]));

const SocialMediaSchema = z.object({
    facebook: optionalUrl('Invalid Facebook URL'),
    twitter: optionalUrl('Invalid Twitter URL'),
    linkedin: optionalUrl('Invalid LinkedIn URL'),
    instagram: optionalUrl('Invalid Instagram URL'),
});

export const PersonnelSchema = z.object({
    profilePictureUrl: z.optional(z.url('Invalid profile picture URL')),
    employeeId: z.string().check(z.minLength(1, 'Employee ID is required')),
    firstName: z.string().check(z.minLength(2, 'First name must be at least 2 characters')),
    lastName: z.string().check(z.minLength(2, 'Last name must be at least 2 characters')),
    office: z.string().check(z.minLength(2, 'Office is required')),
    rankId: z.uuid('Rank is required'),
    designationId: z.optional(z.nullable(z.uuid())),
    contactNumber: z.optional(
        z.string().check(z.minLength(7, 'Contact number must be at least 7 characters')),
    ),
    education: z.array(EducationEntrySchema),
    socialMedia: SocialMediaSchema,
});

export const RegisterPersonnelSchema = z.object({
    email: z.email('Please enter a valid email'),
});

export const UpdatePersonnelSchema = z.extend(PersonnelSchema, {
    id: z.string(),
});

export type RegisterPersonnelData = z.infer<typeof RegisterPersonnelSchema>;
export type PersonnelFormData = z.infer<typeof PersonnelSchema>;
