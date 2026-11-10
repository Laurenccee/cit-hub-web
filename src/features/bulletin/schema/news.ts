import * as z from 'zod/mini';

const NewsBaseSchema = z.object({
    title: z.string().check(z.minLength(3, 'Title must be at least 3 characters')),
    description: z.optional(z.string()),
    content: z.optional(z.string()),
    slug: z
        .string()
        .check(
            z.minLength(1, 'Slug is required'),
            z.regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
                'Slug must be lowercase letters, numbers, hyphens, and optional / separator',
            ),
        ),
    imageUrl: z.optional(z.string()),
    imageAlt: z.optional(z.string()),
    typesId: z.optional(z.string()),
    isPublished: z.boolean(),
    isFeatured: z.boolean(),
});

export const NewsSchema = NewsBaseSchema;

export type NewsFormData = z.infer<typeof NewsSchema>;
