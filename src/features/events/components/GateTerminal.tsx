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
        className: "border-primary/30 bg-primary/5 text-primary",
      };
    case "success":
      return {
        text: "TAP RECORDED • READY FOR NEXT",
        className: "border-success/30 bg-success/10 text-success",
      };
    case "warning":
      return {
        text: "ATTENTION • NEEDS REVIEW",
        className: "border-warning/30 bg-warning/10 text-warning",
      };
    case "queued":
      return {
        text: "OFFLINE • TAP SAVED ON DEVICE",
        className: "border-primary/30 bg-primary/10 text-primary",
      };
    case "error":
      return {
        text: "SCAN FAILED • TRY AGAIN",
        className: "border-destructive/30 bg-destructive/10 text-destructive",
      };
    case "idle":
    default:
      return {
        text: "READY TO SCAN • AWAITING TAP",
        className: "border-border bg-muted text-muted-foreground",
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
      <Card className="flex flex-row items-start justify-between gap-4 rounded-2xl bg-card p-5 sm:p-6">
        <div className="min-w-0">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Events
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {event.title}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-muted-foreground">
                {event.location ?? "CIT Campus"}
              </span>
            </span>
            <span className="text-muted-foreground/60">•</span>
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
              className="text-xs font-bold text-primary hover:underline"
            >
              {isLogin ? "Go to Log Out →" : "Go to Log In →"}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-5 py-3.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span>
            <span className="block text-micro font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Total Checked In
            </span>
            <span className="block font-serif text-3xl font-black leading-none text-foreground">
              {attendance.total.toLocaleString()}
            </span>
          </span>
        </div>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
        {/* Scanner column */}
        <Card className="flex flex-col gap-4 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              aria-live="polite"
              className={cn(
                "h-7 px-3 text-micro font-black tracking-wide",
                pill.className,
              )}
            >
              {pill.text}
            </Badge>
            <span className="shrink-0 font-mono text-micro uppercase tracking-wider text-muted-foreground">
              Gate A • Reader #02
            </span>
          </div>

          <VerifiedIdCard result={lastResult} />

          <Button
            variant="outline"
            size="xl"
            onClick={resetTerminal}
            className="gap-2 text-sm font-semibold text-muted-foreground"
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
                  className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Enter
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>

          {scan.kind === "idle" && !lastResult && (
            <p className="flex items-center justify-center gap-2 text-micro text-muted-foreground">
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
