import { Clock, MapPin, User } from "lucide-react";
import { formatRange } from "@/utils/formatters";
import EventImage from "./EventImage";
import type { EventItem } from "../types";

export function EventDetailHero({ event }: { event: EventItem }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <EventImage
        event={event}
        className="aspect-cinematic w-full"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium uppercase tracking-label">
          <span className="rounded bg-primary px-2.5 py-1 text-micro">
            {event.organizer ?? "College of Computer Studies"}
          </span>
          <span className="text-white/50">•</span>
          <span className="text-white/70">
            {event.category?.label ?? "Campus Event"}
          </span>
        </div>
        <h1 className="mt-2 text-display text-white">
          {event.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.location ?? "CIT Campus"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {formatRange(event.start_date, event.end_date)} PST
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4" />
            Host: {event.host ?? "TBA"}
          </span>
        </div>
      </div>
    </div>
  );
}
