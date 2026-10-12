"use client";

import { CloudOff, RefreshCw, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DeskSyncStatus } from "../types";

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
  const { online, pending, syncing, rosterSyncedAt } = status;
  const queued = `${pending} tap${pending === 1 ? "" : "s"}`;

  let label: string;
  if (!online) {
    label = pending > 0 ? `Offline — ${queued} queued` : "Offline — taps are saved here";
  } else if (syncing) {
    label = "Syncing queued taps…";
  } else if (pending > 0) {
    label = `${queued} waiting to sync`;
  } else {
    label = "Online";
  }

  const Icon = !online ? CloudOff : syncing ? RefreshCw : Wifi;

  return (
    <Badge
      variant="outline"
      title={
        rosterSyncedAt
          ? `Roster cached ${new Date(rosterSyncedAt).toLocaleString()}`
          : "Roster not cached on this device yet"
      }
      className={cn(
        "h-auto gap-1.5 rounded-full px-2.5 py-1 text-micro font-semibold",
        !online
          ? "border-warning/40 bg-warning/10 text-warning"
          : pending > 0
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground",
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", syncing && online && "animate-spin")} />
      {label}
    </Badge>
  );
}
