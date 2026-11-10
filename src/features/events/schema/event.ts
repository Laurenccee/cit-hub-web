import * as z from 'zod/mini';

const isParsableDate = (value: string) => !Number.isNaN(Date.parse(value));

export const EventSchema = z.object({
  title: z
    .string()
    .check(
      z.minLength(3, 'Title must be at least 3 characters'),
      z.maxLength(200, 'Title must be at most 200 characters'),
    ),
  slug: z
    .string()
    .check(
      z.minLength(3, 'Slug must be at least 3 characters'),
      z.maxLength(200, 'Slug must be at most 200 characters'),
      z.regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      ),
    ),
  description: z.union([
    z.optional(
      z.string().check(z.maxLength(20000, 'Description must be at most 20000 characters')),
    ),
    z.literal(''),
  ]),
  location: z
    .string()
    .check(
      z.minLength(3, 'Location must be at least 3 characters'),
      z.maxLength(200, 'Location must be at most 200 characters'),
    ),
  startDate: z
    .string()
    .check(
      z.minLength(1, 'Start date is required'),
      z.refine(isParsableDate, 'Start date is invalid'),
    ),
  endDate: z
    .union([z.optional(z.string()), z.literal('')])
    .check(z.refine((value) => !value || isParsableDate(value), 'End date is invalid')),
  categoryId: z.uuid('Invalid category'),
  imageAlt: z.union([
    z.optional(z.string().check(z.maxLength(300, 'Alt text must be at most 300 characters'))),
    z.literal(''),
  ]),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

export type EventFormData = z.infer<typeof EventSchema>;
