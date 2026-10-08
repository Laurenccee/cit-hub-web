"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CloudOff,
  LogIn,
  LogOut,
  MapPin,
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

interface GateTerminalProps {
  event: EventItem;
  mode: DeskDirection;
  initialCheckins: DeskCheckin[];
  initialAttendance: EventAttendance;
}

function formatRange(start: string, end?: string | null) {
  const format = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (!end) return format(start);
  return `${format(start)} – ${format(end)}`;
}

export default function GateTerminal({
  event,
  mode,
  initialCheckins,
  initialAttendance,
}: GateTerminalProps) {
  const live = isEventLive(event);
  const isLogin = mode === "in";
  const ModeIcon = isLogin ? LogIn : LogOut;

  const {
    scan,
    buffer,
    manualUid,
    setManualUid,
    checkins,
    attendance,
    syncStatus,
    processScan,
    handleManualSubmit,
  } = useScanTerminal({
    eventId: event.id,
    direction: mode,
    initialCheckins,
    initialAttendance,
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Event context */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white",
                isLogin ? "bg-[#8B1A1A]" : "bg-slate-800",
              )}
            >
              <ModeIcon className="h-3.5 w-3.5" />
              {isLogin ? "Event Log In" : "Event Log Out"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                live
                  ? "border-red-200 bg-red-50 text-[#8B1A1A]"
                  : "border-slate-200 bg-white text-slate-500",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-red-500" : "bg-slate-300")} />
              {live ? "Live now" : "Upcoming"}
            </span>
            <DeskSyncBadge status={syncStatus} />
          </p>
          <h2 className="mt-2 truncate font-serif text-2xl font-semibold text-slate-900">
            {event.title}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {event.location ?? "CIT Campus"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {formatRange(event.start_date, event.end_date)}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to event
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href={isLogin ? `/events/${event.id}/logout` : `/events/${event.id}/login`}
            className="font-semibold text-[#8B1A1A] hover:text-[#6B1515]"
          >
            {isLogin ? "Go to Log Out →" : "Go to Log In →"}
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Scanner panel */}
        <div className="flex h-fit flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm">
          <div
            aria-live="polite"
            className={cn(
              "flex min-h-40 flex-col items-center justify-center gap-1.5 rounded-lg border px-4 py-8 text-center",
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
                <ScanLine className="h-9 w-9 text-slate-300" />
                <p className="text-base font-bold text-slate-700">
                  Tap card to {isLogin ? "log in" : "log out"}
                </p>
                <p className="text-xs text-slate-400">
                  {buffer ? (
                    <>
                      Reading: <code className="font-mono font-bold text-slate-600">{buffer}</code>
                    </>
                  ) : (
                    "Waiting for RFID reader…"
                  )}
                </p>
              </>
            )}
            {scan.kind === "processing" && (
              <>
                <Nfc className="h-9 w-9 animate-pulse text-[#8B1A1A]" />
                <p className="text-sm font-semibold text-slate-600">
                  Processing <code className="font-mono">{scan.uid}</code>…
                </p>
              </>
            )}
            {scan.kind === "success" && (
              <>
                <CheckCircle2 className="h-9 w-9 text-green-600" />
                <p className="text-sm font-semibold text-green-800">{scan.message}</p>
                <p className="text-[11px] uppercase tracking-wide text-green-600">
                  {new Date().toLocaleTimeString()} • Ready for next tap
                </p>
              </>
            )}
            {scan.kind === "warning" && (
              <>
                <AlertTriangle className="h-9 w-9 text-amber-500" />
                <p className="text-sm font-semibold text-amber-800">{scan.message}</p>
              </>
            )}
            {scan.kind === "queued" && (
              <>
                <CloudOff className="h-9 w-9 text-sky-600" />
                <p className="text-sm font-semibold text-sky-800">{scan.message}</p>
                <p className="text-[11px] uppercase tracking-wide text-sky-600">
                  {scan.direction === "in" ? "Check-in" : "Check-out"} queued on this device
                </p>
              </>
            )}
            {scan.kind === "error" && (
              <>
                <XCircle className="h-9 w-9 text-red-500" />
                <p className="text-sm font-semibold text-red-700">{scan.message}</p>
              </>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              value={manualUid}
              onChange={(e) => setManualUid(e.target.value)}
              placeholder="Or type card UID manually…"
              aria-label="Card UID"
              className="h-11 font-mono text-sm"
            />
            <Button
              type="submit"
              disabled={!manualUid.trim()}
              className={cn(
                "h-11 shrink-0 text-xs font-semibold text-white",
                isLogin ? "bg-[#8B1A1A] hover:bg-[#6B1515]" : "bg-slate-800 hover:bg-slate-900",
              )}
            >
              {isLogin ? "Log In" : "Log Out"}
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
            <h3 className="text-sm font-bold text-slate-900">
              Scan log
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {checkins.length}
              </span>
            </h3>
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
