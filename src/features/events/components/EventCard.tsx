"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Pencil, QrCode, Users } from "lucide-react";
import Link from "next/link";
import { EventItem } from "../types";
import { EventCover } from "./EventCover";

interface EventCardProps {
  event: EventItem;
}

const ACADEMIC_KEYWORDS = [
  "academic",
  "career",
  "competition",
  "research",
  "workshop",
  "colloquium",
  "expo",
  "challenge",
  "fair",
  "ctf",
];

function badgeClasses(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("career")) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }
  if (lower.includes("cultural") || lower.includes("arts")) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }
  return "border-red-100 bg-red-50 text-[#8B1A1A]";
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isAcademicEvent(event: EventItem) {
  const haystack =
    `${event.category?.label ?? ""} ${event.title}`.toLowerCase();
  return ACADEMIC_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

export default function EventCard({ event }: EventCardProps) {
  const start = new Date(event.start_date);
  const monthDay = start
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    .toUpperCase();
  const weekday = start.toLocaleDateString("en-US", { weekday: "long" });

  const filled = event.capacity_filled ?? 0;
  const headcount =
    event.capacity_unit === "teams" ? `${filled} Teams` : `${filled} Attendees`;

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <EventCover cover={event.cover} className="aspect-[16/9]" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={`max-w-[65%] truncate rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClasses(event.category?.label ?? "")}`}
          >
            {event.category?.label ?? "Campus Event"}
          </Badge>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-900">
              {monthDay}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{weekday}</p>
          </div>
        </div>

        <h3 className="mt-3 line-clamp-2 text-[15px] font-bold leading-snug text-slate-900">
          {event.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-relaxed text-slate-500">
          {event.description ||
            event.content ||
            "Details will be announced soon."}
        </p>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{event.location ?? "CIT Campus"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {formatTime(event.start_date)}
            {event.end_date ? ` – ${formatTime(event.end_date)}` : ""}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            Registered
          </span>
          <span className="text-xs font-bold text-slate-800">{headcount}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 bg-slate-100 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-200"
          asChild
        >
          <Link href={`/events/${event.slug}`}>View Details</Link>
        </Button>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Edit ${event.title}`}
            className="h-8 w-8 text-slate-400 hover:text-slate-700"
            asChild
          >
            <Link href={`/events/${event.slug}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Show QR code for ${event.title}`}
            className="h-8 w-8 text-slate-400 hover:text-slate-700"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
