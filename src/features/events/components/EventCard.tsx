"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import type { EventItem } from "../types";
import EventImage from "./EventImage";

interface EventCardProps {
  event: EventItem;
}

function badgeClasses(label: string) {
  const lower = label.toLowerCase();
  if (
    lower.includes("career") ||
    lower.includes("cultural") ||
    lower.includes("arts")
  ) {
    return "border-border bg-muted text-muted-foreground";
  }
  return "border-primary/20 bg-primary/10 text-primary";
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function eventDateParts(value: string) {
  const start = new Date(value);
  return {
    monthDay: start
      .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
      .toUpperCase(),
    weekday: start.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

function headcountLabel(event: EventItem) {
  const filled = event.capacity_filled ?? 0;
  return event.capacity_unit === "teams" ? `${filled} Teams` : `${filled} Attendees`;
}

function eventBlurb(event: EventItem) {
  return event.description || event.content || "Details will be announced soon.";
}

function endTimeSuffix(event: EventItem) {
  return event.end_date ? ` – ${formatTime(event.end_date)}` : "";
}

export default function EventCard({ event }: EventCardProps) {
  const { monthDay, weekday } = eventDateParts(event.start_date);
  const categoryLabel = event.category?.label;
  const headcount = headcountLabel(event);

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md">
      <EventImage event={event} className="aspect-video" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={`max-w-[65%] truncate rounded-full px-2.5 py-1 text-micro font-semibold ${badgeClasses(categoryLabel ?? "")}`}
          >
            {categoryLabel ?? "Campus Event"}
          </Badge>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-xs font-bold uppercase tracking-wide text-foreground">
              {monthDay}
            </p>
            <p className="mt-0.5 text-micro text-muted-foreground">{weekday}</p>
          </div>
        </div>

        <h3 className="mt-3 line-clamp-2 text-subtitle leading-snug text-foreground">
          {event.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
          {eventBlurb(event)}
        </p>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{event.location ?? "CIT Campus"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            {formatTime(event.start_date)}
            {endTimeSuffix(event)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-micro text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
            Registered
          </span>
          <span className="text-xs font-bold text-foreground">{headcount}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-5 py-3">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 px-3 text-xs font-semibold"
          asChild
        >
          <Link href={`/events/${event.slug}`}>View Details</Link>
        </Button>
      </div>
    </Card>
  );
}
