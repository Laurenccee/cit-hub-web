"use client";

import { CloudOff, RefreshCw, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { DeskSyncStatus } from "../types";

function syncLabel({ online, pending, syncing }: DeskSyncStatus) {
  const queued = `${pending} tap${pending === 1 ? "" : "s"}`;
  if (!online) {
    return pending > 0 ? `Offline — ${queued} queued` : "Offline — taps are saved here";
  }
  if (syncing) return "Syncing queued taps…";
  if (pending > 0) return `${queued} waiting to sync`;
  return "Online";
}

function SyncIcon({ status }: { status: DeskSyncStatus }) {
  const { online, syncing } = status;
  const className = cn("h-3.5 w-3.5", syncing && online && "animate-spin");
  if (!online) return <CloudOff className={className} />;
  return syncing ? <RefreshCw className={className} /> : <Wifi className={className} />;
}

function syncTone({ online, pending }: DeskSyncStatus) {
  if (!online) return "border-warning/40 bg-warning/10 text-warning";
  if (pending > 0) return "border-primary/30 bg-primary/10 text-primary";
  return "border-border bg-card text-muted-foreground";
}

function cacheTitle(rosterSyncedAt: DeskSyncStatus["rosterSyncedAt"]) {
  return rosterSyncedAt
    ? `Roster cached ${new Date(rosterSyncedAt).toLocaleString()}`
    : "Roster not cached on this device yet";
}

/**
 * Connectivity + queue readout for the check-in desk. Taps keep working while
 * offline, so the badge exists to make that visible rather than to warn.
 */
export default function DeskSyncBadge({
  status,
  className,
}: {
  status: DeskSyncStatus;
  className?: string;
}) {
  const { rosterSyncedAt } = status;

  return (
    <Badge
      variant="outline"
      title={cacheTitle(rosterSyncedAt)}
      className={cn(
        "h-auto gap-1.5 rounded-full px-2.5 py-1 text-micro font-semibold",
        syncTone(status),
        className,
      )}
    >
      <SyncIcon status={status} />
      {syncLabel(status)}
    </Badge>
  );
}
