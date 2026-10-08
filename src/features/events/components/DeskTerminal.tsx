"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CloudOff,
  LogIn,
  LogOut,
  Nfc,
  ScanLine,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DeskCheckin,
  EventAttendance,
  EventItem,
} from "../types";
import { DeskDirection } from "../action";
import { isEventLive } from "../utils";
import CheckinLogList from "./CheckinLogList";
import DeskSyncBadge from "./DeskSyncBadge";
import { useScanTerminal } from "../hooks/useScanTerminal";

interface DeskTerminalProps {
  events: EventItem[];
  selectedEvent: EventItem;
  initialCheckins: DeskCheckin[];
  initialAttendance: EventAttendance;
}

export default function DeskTerminal({
  events,
  selectedEvent,
  initialCheckins,
  initialAttendance,
}: DeskTerminalProps) {
  const router = useRouter();
  const [direction, setDirection] = useState<DeskDirection>("in");

  const live = isEventLive(selectedEvent);

  const {
    scan,
    buffer,
    manualUid,
    setManualUid,
    checkins,
    attendance,
    syncStatus,
    handleManualSubmit,
  } = useScanTerminal({
    eventId: selectedEvent.id,
    direction,
    initialCheckins,
    initialAttendance,
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Scanner panel */}
        <div className="flex h-fit flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm">
          <div>
            <label
              htmlFor="desk-event"
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400"
            >
              Event
            </label>
            <div className="relative mt-1.5">
              <select
                id="desk-event"
                value={selectedEvent.slug}
                onChange={(e) => router.push(`/desk?event=${e.target.value}`)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pr-9 pl-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.slug}>
                    {isEventLive(event) ? "● " : ""}
                    {event.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-red-500" : "bg-slate-300")} />
              {live ? "Live now" : "Upcoming"} • {selectedEvent.location ?? "CIT Campus"}
            </p>
            <DeskSyncBadge status={syncStatus} className="mt-2" />
          </div>

          {/* Direction toggle */}
          <div
            className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Scan direction"
          >
            {(
              [
                { value: "in", label: "Log In", icon: LogIn },
                { value: "out", label: "Log Out", icon: LogOut },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={direction === value}
                onClick={() => setDirection(value)}
                className={cn(
                  "flex h-10 items-center justify-center gap-1.5 rounded-md text-sm font-bold transition-colors",
                  direction === value
                    ? value === "in"
                      ? "bg-[#8B1A1A] text-white shadow"
                      : "bg-slate-800 text-white shadow"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Status readout */}
          <div
            aria-live="polite"
            className={cn(
              "flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-lg border px-4 py-5 text-center",
              scan.kind === "success" && "border-green-200 bg-green-50",
              scan.kind === "warning" && "border-amber-200 bg-amber-50",
              scan.kind === "queued" && "border-sky-200 bg-sky-50",
              scan.kind === "error" && "border-red-200 bg-red-50",
              (scan.kind === "idle" || scan.kind === "processing") &&
                "border-dashed border-slate-200 bg-slate-50/60",
            )}
          >
            {scan.kind === "idle" && (
              <>
                <ScanLine className="h-7 w-7 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">
                  Ready for {direction === "in" ? "check-in" : "check-out"}…
                </p>
                <p className="text-xs text-slate-400">
                  {buffer ? (
                    <>
                      Reading: <code className="font-mono font-bold text-slate-600">{buffer}</code>
                    </>
                  ) : (
                    "Tap a card on the reader"
                  )}
                </p>
              </>
            )}
            {scan.kind === "processing" && (
              <>
                <Nfc className="h-7 w-7 animate-pulse text-[#8B1A1A]" />
                <p className="text-sm font-semibold text-slate-600">
                  Processing <code className="font-mono">{scan.uid}</code>…
                </p>
              </>
            )}
            {scan.kind === "success" && (
              <>
                <CheckCircle2 className="h-7 w-7 text-green-600" />
                <p className="text-sm font-semibold text-green-800">{scan.message}</p>
                <p className="text-[11px] uppercase tracking-wide text-green-600">
                  {scan.direction === "in" ? "Logged in" : "Logged out"} • {new Date().toLocaleTimeString()}
                </p>
              </>
            )}
            {scan.kind === "warning" && (
              <>
                <AlertTriangle className="h-7 w-7 text-amber-500" />
                <p className="text-sm font-semibold text-amber-800">{scan.message}</p>
              </>
            )}
            {scan.kind === "queued" && (
              <>
                <CloudOff className="h-7 w-7 text-sky-600" />
                <p className="text-sm font-semibold text-sky-800">{scan.message}</p>
                <p className="text-[11px] uppercase tracking-wide text-sky-600">
                  {scan.direction === "in" ? "Check-in" : "Check-out"} queued on this device
                </p>
              </>
            )}
            {scan.kind === "error" && (
              <>
                <XCircle className="h-7 w-7 text-red-500" />
                <p className="text-sm font-semibold text-red-700">{scan.message}</p>
              </>
            )}
          </div>

          {/* Manual fallback */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              value={manualUid}
              onChange={(e) => setManualUid(e.target.value)}
              placeholder="Or type card UID manually…"
              aria-label="Card UID"
              className="h-10 font-mono text-xs"
            />
            <Button
              type="submit"
              disabled={!manualUid.trim()}
              className="h-10 shrink-0 bg-[#8B1A1A] text-xs font-semibold hover:bg-[#6B1515]"
            >
              {direction === "in" ? "Log In" : "Log Out"}
            </Button>
          </form>
        </div>

        {/* Stats + list */}
        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Present", value: attendance.present, accent: false },
              { label: "Departed", value: attendance.departed, accent: false },
              { label: "Total taps", value: attendance.total, accent: true },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-3 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-serif text-2xl font-bold",
                    stat.accent ? "text-[#8B1A1A]" : "text-slate-900",
                  )}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Scan log
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {checkins.length}
              </span>
            </h2>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Auto-refreshing
            </p>
          </div>

          <CheckinLogList checkins={checkins} />
        </div>
      </div>
    </div>
  );
}
