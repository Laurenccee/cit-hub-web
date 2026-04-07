import { z } from 'zod';

const educationEntrySchema = z.object({
  degree: z.string().min(2, 'Degree is required'),
  major: z.string().optional(),
  institution: z.string().min(2, 'Institution is required'),
  yearGraduated: z
    .number()
    .int('Year graduated must be an integer')
    .min(1800, 'Year graduated must be after 1800')
    .max(new Date().getFullYear(), 'Year graduated cannot be in the future')
    .optional(),
  onGoing: z.boolean(),
});

const socialMediaSchema = z.object({
  facebook: z.string().url('Invalid Facebook URL').or(z.literal('')).optional(),
  twitter: z.string().url('Invalid Twitter URL').or(z.literal('')).optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
  instagram: z
    .string()
    .url('Invalid Instagram URL')
    .or(z.literal(''))
    .optional(),
});

const sharedPersonnelFields = {
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  education: z.array(educationEntrySchema),
  rankId: z.number({ message: 'Rank is required' }),
  designationId: z.number().optional(),
  office: z.string().min(2, 'Office is required'),
  contactNumber: z
    .string()
    .min(7, 'Contact number must be at least 7 characters'),
  socialMedia: socialMediaSchema,
  profilePictureUrl: z.string().url('Invalid profile picture URL').optional(),
};

export const personnelSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  ...sharedPersonnelFields,
});

export const updatePersonnelSchema = z.object({
  id: z.string(),
  ...sharedPersonnelFields,
});

export type PersonnelFormData = z.infer<typeof personnelSchema>;
export type UpdatePersonnelFormData = z.infer<typeof updatePersonnelSchema>;
