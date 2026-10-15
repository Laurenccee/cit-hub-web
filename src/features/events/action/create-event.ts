'use server';

import { getAuthorizedAdmin } from '@/actions';
import { runMutation } from '@/actions/mutation';
import { ROUTES } from '@/utils/constants/routes';
import { EventSchema, type EventFormData } from '../schema/event';
import { GetEventCategories } from './queries';
import type { QueryResult } from '@/types/action';
import type { CreateEventResult, EventCategory } from '../types';

export async function getEventCategoriesAction(): Promise<QueryResult<EventCategory[]>> {
  const { success, data } = await GetEventCategories();
  if (!success) return { success: false, data: [] };
  return { success: true, data };
}

/** Maps the camelCase form fields onto their snake_case `events` columns. */
function toEventPayload(data: EventFormData, imageUrl: string | null | undefined) {
  return {
    title: data.title,
    slug: data.slug,
    description: data.description || null,
    location: data.location,
    start_date: data.startDate ? new Date(data.startDate).toISOString() : data.startDate,
    end_date: data.endDate ? new Date(data.endDate).toISOString() : null,
    category_id: data.categoryId || null,
    image_url: imageUrl ?? null,
    image_alt: data.imageAlt || null,
    is_published: data.isPublished,
    is_featured: data.isFeatured,
    is_archived: false,
  };
}

/**
 * Create a new event. Accepts a validated, typed EventFormData object —
 * the caller (useEventForm) owns form validation via zodResolver and uploads
 * the cover image through `uploadEventImageAction` before submitting.
 * Form keys use camelCase; this action maps them to snake_case DB columns.
 */
export async function createEventAction(
  values: EventFormData,
  imageUrl?: string | null,
): Promise<CreateEventResult> {
  return runMutation({
    values,
    schema: EventSchema,
    authorize: getAuthorizedAdmin,
    revalidate: [ROUTES.EVENTS, { path: `${ROUTES.EVENTS}/[slug]`, type: 'page' }],
    unauthorizedMessage: 'Forbidden: Admin only',
    invalidMessage: 'Validation failed',
    failureMessage: 'Failed to create event',
    conflictMessage: 'An event with this slug already exists',
    execute: async (data, { supabase, userId }) => {
      const { data: event, error } = await supabase
        .from('events')
        .insert({ ...toEventPayload(data, imageUrl), created_by: userId, updated_by: userId })
        .select('id')
        .single();
      return { error, extra: { eventId: event?.id } };
    },
  });
}
