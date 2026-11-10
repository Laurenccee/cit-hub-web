import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { formatDateShort } from "@/utils/formatters";
import EventImage from "./EventImage";
import { EventCategoryBadge } from "./EventCategoryBadge";
import type { EventItem } from "../types";

function RelatedEventCard({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <EventImage event={event} className="aspect-video" />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <EventCategoryBadge
            color={event.category?.color}
            label={event.category?.label ?? "Event"}
          />
        </div>
        <h3 className="text-subtitle text-foreground transition-colors group-hover:text-primary">
          {event.title}
        </h3>
        <p className="mt-1.5 flex-1 text-sm text-muted-foreground line-clamp-2">
          {event.description ?? "View event details"}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDateShort(event.start_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function RelatedEvents({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;
  return (
    <section>
      <h2 className="text-section text-foreground">
        Related Events
      </h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((relatedEvent) => (
          <RelatedEventCard key={relatedEvent.id} event={relatedEvent} />
        ))}
      </div>
    </section>
  );
}
