import { z } from 'zod';

const NewsBaseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    content: z.string().optional(),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
            'Slug must be lowercase letters, numbers, hyphens, and optional / separator',
        ),
    imageUrl: z.string().optional(),
    imageAlt: z.string().optional(),
    typesId: z.string().optional(),
    isPublished: z.boolean(),
    isFeatured: z.boolean(),
});

export const NewsSchema = NewsBaseSchema;
export const UpdateNewsSchema = NewsBaseSchema.extend({ id: z.string() });

export type NewsFormData = z.infer<typeof NewsSchema>;
