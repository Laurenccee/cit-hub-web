"use client";

import { Clock, MapPin, User, Users } from "lucide-react";
import { EventAttendance, EventItem } from "../types";
import EventImage from "./EventImage";
import LiveActivityFeed from "./LiveActivityFeed";
import { EventAttendanceStats } from "./EventAttendanceStats";
import { EventCheckInButtons } from "./EventCheckInButtons";
import { isEventLive } from "../utils";
import { formatRange } from "@/utils/formatters";

interface EventHeroProps {
  event: EventItem;
  attendance: EventAttendance;
}

export default function EventHero({ event, attendance }: EventHeroProps) {
  const { present, departed, total } = attendance;
  const live = isEventLive(event);

  return (
    <div className="grid overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Left: event spotlight */}
      <div className="min-w-0 p-4 sm:p-5">
        <div className="relative">
          <EventImage
            event={event}
            rounded="rounded-lg"
            className="aspect-21/9"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-micro font-bold uppercase tracking-wide text-primary-foreground shadow">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              {live ? "Live in progress" : "Upcoming event"}
            </span>
            <span className="text-micro font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {sessionLabel(event.start_date, event.end_date)}
            </span>
          </div>
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-micro font-bold uppercase tracking-[0.1em]">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">
            {event.organizer ?? "College of Computer Studies"}
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span className="text-muted-foreground">
            {event.category?.label ?? "Departmental Keynote"}
          </span>
        </p>
        <h2 className="mt-1.5 font-serif text-3xl font-semibold leading-tight text-foreground">
          {event.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {event.description ??
            event.content ??
            "Join us for a day of talks, demos, and hands-on sessions across the CIT community."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
            {event.location ?? "Main Auditorium & Hybrid Stream"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
            {formatRange(event.start_date, event.end_date)} PST
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground/70" />
            Host: {event.host ?? "Dr. Alicia Ramos & CIT Council"}
          </span>
        </div>
      </div>

      {/* Right: live attendance rail */}
      <div className="flex min-w-0 flex-col gap-4 border-t border-border bg-muted/40 p-4 sm:p-5 lg:border-l lg:border-t-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
              Live Attendance &amp; Check-In
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-1.5 py-0.5 text-micro font-bold uppercase tracking-wide text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Online
              </span>
            </p>
            <span className="shrink-0 rounded bg-primary px-2 py-1 text-micro font-bold uppercase tracking-wide text-primary-foreground">
              Station #1
            </span>
          </div>
          <p className="mt-1 text-micro text-muted-foreground">
            Real-time RFID scanner &amp; digital entry desk • Gate A
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block text-micro font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Current live presence
            </span>
            <span className="block truncate text-xs font-semibold text-foreground">
              CIT Main Auditorium
            </span>
          </span>
          <span className="ml-auto shrink-0 text-right">
            <span className="block font-serif text-3xl font-bold leading-none text-foreground">
              {present}
            </span>
            <span className="mt-1 block text-micro font-bold uppercase tracking-wide text-success">
              Active inside
            </span>
          </span>
        </div>

        <EventCheckInButtons
          eventId={event.id}
          checkInLabel="Event Log In"
          checkOutLabel="Event Log Out"
        />

        <EventAttendanceStats present={present} departed={departed} total={total} />

        <div className="mt-auto border-t border-border pt-3">
          <LiveActivityFeed
            eventId={event.id}
            initialRecent={attendance.recent}
          />
        </div>
      </div>
    </div>
  );
}

function sessionLabel(start: string, end?: string | null) {
  const now = Date.now();
  const startAt = new Date(start).getTime();
  if (end) {
    const endAt = new Date(end).getTime();
    if (now > endAt) return "Session ended";
    if (now >= startAt) {
      const mins = Math.max(1, Math.round((endAt - now) / 60000));
      if (mins < 60) return `Ends in ${mins} min${mins === 1 ? "" : "s"}`;
      const hours = Math.floor(mins / 60);
      const rest = mins % 60;
      return rest === 0 ? `Ends in ${hours} hr${hours === 1 ? "" : "s"}` : `Ends in ${hours}h ${rest}m`;
    }
  }
  if (now < startAt) {
    return `Starts ${new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  }
  return "Live now";
}
