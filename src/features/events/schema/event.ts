import { z } from 'zod';

export const EventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must be at most 200 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens',
    ),
  description: z
    .string()
    .max(20000, 'Description must be at most 20000 characters')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be at most 200 characters'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Start date is invalid'),
  endDate: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      'End date is invalid',
    ),
  categoryId: z.string().uuid('Invalid category'),
  imageAlt: z.string().max(300, 'Alt text must be at most 300 characters').optional().or(z.literal('')),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

export const UpdateEventSchema = EventSchema.extend({ id: z.string() });

export type EventFormData = z.infer<typeof EventSchema>;
export type UpdateEventFormData = z.infer<typeof UpdateEventSchema>;