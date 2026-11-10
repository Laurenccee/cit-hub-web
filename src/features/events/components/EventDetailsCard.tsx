import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFullDate } from "@/utils/formatters";
import { EventCategoryBadge } from "./EventCategoryBadge";
import type { EventItem } from "../types";

function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <dt className="text-micro font-semibold uppercase tracking-label text-muted-foreground">
      {children}
    </dt>
  );
}

function EventCapacity({ event }: { event: EventItem }) {
  if (!event.capacity_total) return null;
  return (
    <div className="sm:col-span-2">
      <DetailLabel>Capacity</DetailLabel>
      <dd className="mt-1 text-foreground">
        {event.capacity_filled ?? 0} / {event.capacity_total}{" "}
        {event.capacity_unit ?? "spots"}
        {event.capacity_label && ` (${event.capacity_label})`}
      </dd>
    </div>
  );
}

export function EventDetailsCard({ event }: { event: EventItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-subtitle">Event Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <DetailLabel>Organizer</DetailLabel>
            <dd className="mt-1 text-foreground">
              {event.organizer ?? "CIT"}
            </dd>
          </div>
          <div>
            <DetailLabel>Category</DetailLabel>
            <dd className="mt-1">
              <EventCategoryBadge
                color={event.category?.color}
                label={event.category?.label ?? "Campus Event"}
              />
            </dd>
          </div>
          <div>
            <DetailLabel>Date &amp; Time</DetailLabel>
            <dd className="mt-1 text-foreground">
              {formatFullDate(event.start_date, event.end_date)}
            </dd>
          </div>
          <div>
            <DetailLabel>Location</DetailLabel>
            <dd className="mt-1 text-foreground">
              {event.location ?? "CIT Campus"}
            </dd>
          </div>
          <EventCapacity event={event} />
        </dl>
      </CardContent>
    </Card>
  );
}
