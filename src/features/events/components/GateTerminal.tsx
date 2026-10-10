"use client";

import Link from "next/link";
import { ChevronLeft, MapPin, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { RotateCcw } from "@hugeicons/core-free-icons";
import { DeskDirection } from "../action";
import type {
  DeskCheckin,
  EventAttendance,
  EventItem,
  ScanState,
} from "../types";
import LiveEntryRoster from "./LiveEntryRoster";
import VerifiedIdCard from "./VerifiedIdCard";
import DeskSyncBadge from "./DeskSyncBadge";
import { useScanTerminal } from "../hooks/useScanTerminal";

interface GateTerminalProps {
  event: EventItem;
  mode: DeskDirection;
  initialCheckins: DeskCheckin[];
  initialAttendance: EventAttendance;
}

function statusPill(scan: ScanState): { text: string; className: string } {
  switch (scan.kind) {
    case "processing":
      return {
        text: "READING RFID CHIP…",
        className: "border-[#8B1A1A]/30 bg-[#8B1A1A]/5 text-[#8B1A1A]",
      };
    case "success":
      return {
        text: "TAP RECORDED • READY FOR NEXT",
        className: "border-green-200 bg-green-50 text-green-700",
      };
    case "warning":
      return {
        text: "ATTENTION • NEEDS REVIEW",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "queued":
      return {
        text: "OFFLINE • TAP SAVED ON DEVICE",
        className: "border-sky-200 bg-sky-50 text-sky-700",
      };
    case "error":
      return {
        text: "SCAN FAILED • TRY AGAIN",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case "idle":
    default:
      return {
        text: "READY TO SCAN • AWAITING TAP",
        className: "border-slate-200 bg-slate-50 text-slate-500",
      };
  }
}

export default function GateTerminal({
  event,
  mode,
  initialCheckins,
  initialAttendance,
}: GateTerminalProps) {
  const isLogin = mode === "in";

  const {
    scan,
    manualUid,
    setManualUid,
    checkins,
    attendance,
    syncStatus,
    lastResult,
    handleManualSubmit,
    resetTerminal,
    removeCheckin,
  } = useScanTerminal({
    eventId: event.id,
    direction: mode,
    initialCheckins,
    initialAttendance,
  });

  const pill = statusPill(scan);

  return (
    <div className="flex flex-col gap-5">
      {/* Event header card */}
      <Card className="flex flex-row items-start justify-between gap-4 rounded-2xl bg-white p-5 sm:p-6">
        <div className="min-w-0">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Events
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {event.title}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#8B1A1A]" />
              <span className="font-semibold text-slate-600">
                {event.location ?? "CIT Campus"}
              </span>
            </span>
            <span className="text-slate-300">•</span>
            <span>{isLogin ? "Gate A Inbound" : "Gate A Outbound"}</span>
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-2">
            <DeskSyncBadge status={syncStatus} />
            <Link
              href={
                isLogin
                  ? `/events/${event.slug}/logout`
                  : `/events/${event.slug}/login`
              }
              className="text-xs font-bold text-[#8B1A1A] hover:text-[#6B1515]"
            >
              {isLogin ? "Go to Log Out →" : "Go to Log In →"}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-5 py-3.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Total Checked In
            </span>
            <span className="block font-serif text-3xl font-black leading-none text-slate-900">
              {attendance.total.toLocaleString()}
            </span>
          </span>
        </div>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
        {/* Scanner column */}
        <Card className="flex flex-col gap-4 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              aria-live="polite"
              className={cn(
                "h-7 px-3 text-[11px] font-black tracking-wide",
                pill.className,
              )}
            >
              {pill.text}
            </Badge>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Gate A • Reader #02
            </span>
          </div>

          <VerifiedIdCard result={lastResult} />

          <Button
            variant="outline"
            size="xl"
            onClick={resetTerminal}
            className="gap-2 text-sm font-semibold text-slate-600"
          >
            <HugeiconsIcon icon={RotateCcw} />
            Clear / Reset
          </Button>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <InputGroup className="h-10 flex-1">
              <InputGroupInput
                value={manualUid}
                onChange={(e) => setManualUid(e.target.value)}
                placeholder="Manual ID (e.g. CIT-2023-8812)"
                aria-label="Manual student ID or card UID"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="submit"
                  disabled={!manualUid.trim()}
                  className="bg-[#8B1A1A] font-semibold text-white hover:bg-[#6B1515]"
                >
                  Enter
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>

          {scan.kind === "idle" && !lastResult && (
            <p className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ScanLine className="h-3.5 w-3.5" />
              Waiting for RFID reader…
            </p>
          )}
        </Card>

        {/* Roster column */}
        <LiveEntryRoster
          checkins={checkins}
          totalRecords={attendance.total}
          eventSlug={event.slug}
          onDelete={removeCheckin}
        />
      </div>
    </div>
  );
}
