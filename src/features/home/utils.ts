import { formatRange } from '@/utils/formatters';
import type { EventItem } from '@/features/events/types';
import type { EventItemProps } from './types';

export const UPCOMING_EVENTS_LIMIT = 5;

export function getUpcomingEvents(events: EventItem[], now: Date = new Date()): EventItemProps[] {
    return events
        .filter((event) => new Date(event.start_date) >= now)
        .slice(0, UPCOMING_EVENTS_LIMIT)
        .map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description ?? event.content ?? '',
            imageUrl: event.image_url ?? '',
            imageAlt: event.image_alt ?? event.title,
            date: event.start_date,
            startTime: formatRange(event.start_date, event.end_date),
            endTime: '',
            slug: event.slug,
        }));
}
