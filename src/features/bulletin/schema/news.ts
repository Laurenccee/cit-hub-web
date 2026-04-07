import { z } from 'zod';

const newsBaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
      'Slug must be lowercase letters, numbers, hyphens, and optional / separator',
    ),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  typesId: z.number({ message: 'Content type is required' }),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

export const newsSchema = newsBaseSchema;
export const updateNewsSchema = newsBaseSchema.extend({ id: z.string() });

export type NewsFormData = z.infer<typeof newsSchema>;
export type UpdateNewsFormData = z.infer<typeof updateNewsSchema>;
