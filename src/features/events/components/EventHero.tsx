"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Clock,
  FileText,
  LogIn,
  LogOut,
  MapPin,
  Pencil,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventItem } from "../types";
import { EventCover } from "./EventCover";
import { LiveActivityFeed } from "./LiveActivityFeed";

interface EventHeroProps {
  event: EventItem;
}

const departedCount = 18;

export function EventHero({ event }: EventHeroProps) {
  const [present, setPresent] = useState(event.capacity_filled ?? 342);
  const [logging, setLogging] = useState(false);

  const total = present + departedCount;

  const handleScan = useCallback(() => {
    setPresent((count) => count + 1);
  }, []);

  const handleLog = () => {
    setLogging(true);
    window.setTimeout(() => {
      setPresent((count) => count + 1);
      setLogging(false);
    }, 600);
  };

  return (
    <div className="grid overflow-hidden rounded-xl border bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Left: event spotlight */}
      <div className="min-w-0 p-4 sm:p-5">
        <div className="relative">
          <EventCover
            cover={event.cover ?? "symposium"}
            rounded="rounded-lg"
            className="aspect-[21/9]"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c2172b] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Live in progress
            </span>
            <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Ends in 2h 45m
            </span>
          </div>
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-bold uppercase tracking-[0.1em]">
          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[#8B1A1A]">
            {event.organizer ?? "College of Computer Studies"}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">
            {event.category?.label ?? "Departmental Keynote"}
          </span>
        </p>
        <h2 className="mt-1.5 font-serif text-3xl font-semibold leading-tight text-slate-900">
          {event.title}
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-500">
          {event.description ??
            event.content ??
            "Join us for a day of talks, demos, and hands-on sessions across the CIT community."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {event.location ?? "Main Auditorium & Hybrid Stream"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {formatRange(event.start_date, event.end_date)} PST
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            Host: {event.host ?? "Dr. Alicia Ramos & CIT Council"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 bg-white text-xs"
              asChild
            >
              <Link href={`/events/${event.slug}`}>
                <Pencil className="h-3.5 w-3.5" />
                Edit Event
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 bg-white text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              View Roster ({present})
            </Button>
          </div>
          <span className="text-[11px] text-slate-400">
            Organizers Control Console
          </span>
        </div>
      </div>

      {/* Right: live attendance rail */}
      <div className="flex min-w-0 flex-col gap-4 border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 lg:border-l lg:border-t-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-slate-900">
              Live Attendance & Check-In
              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Online
              </span>
            </p>
            <span className="shrink-0 rounded bg-[#8B1A1A] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
              Station #1
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Real-time RFID scanner & digital entry desk • Gate A
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <Users className="h-5 w-5 text-[#8B1A1A]" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Current live presence
            </span>
            <span className="block truncate text-xs font-semibold text-slate-700">
              CIT Main Auditorium
            </span>
          </span>
          <span className="ml-auto shrink-0 text-right">
            <span className="block font-serif text-[26px] font-bold leading-none text-slate-900">
              {present}
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-green-600">
              Active inside
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            disabled={logging}
            onClick={handleLog}
            className="h-9 gap-1.5 bg-[#8B1A1A] text-xs font-semibold hover:bg-[#6B1515]"
          >
            <LogIn className="h-3.5 w-3.5" />
            Event Log In
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={logging}
            onClick={handleLog}
            className="h-9 gap-1.5 bg-white text-xs font-semibold"
          >
            <LogOut className="h-3.5 w-3.5" />
            Event Log Out
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Present", value: String(present), accent: false },
            { label: "Departed", value: String(departedCount), accent: false },
            { label: "Total Pass", value: String(total), accent: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-slate-200 bg-white px-2 py-2 text-center"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {stat.label}
              </p>
              <p
                className={`mt-0.5 text-sm font-bold ${stat.accent ? "text-[#8B1A1A]" : "text-slate-800"}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3">
          <LiveActivityFeed onScan={handleScan} />
        </div>
      </div>
    </div>
  );
}

function formatRange(start: string, end?: string) {
  const format = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const startLabel = format(start);
  if (!end) return startLabel;
  return `${startLabel} – ${format(end)}`;
}
