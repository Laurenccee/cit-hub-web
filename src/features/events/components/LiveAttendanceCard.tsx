import { Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LiveActivityFeed from "./LiveActivityFeed";
import { EventAttendanceStats } from "./EventAttendanceStats";
import { EventCheckInButtons } from "./EventCheckInButtons";
import type { EventAttendance, EventItem } from "../types";

interface LiveAttendanceCardProps {
  event: EventItem;
  attendance: EventAttendance;
  isStudent: boolean;
}

function LiveAttendanceHeader() {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Live Attendance</p>
            <p className="text-xs text-muted-foreground">
              Real-time RFID check-in
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-1.5 py-0.5 text-micro font-bold uppercase tracking-wide text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Online
        </span>
      </div>
    </CardHeader>
  );
}

function LivePresenceCount({ location, present }: { location?: string | null; present: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div>
        <p className="text-micro font-bold uppercase tracking-label-wide text-muted-foreground">
          Current live presence
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {location ?? "CIT Main Auditorium"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold text-foreground">
          {present}
        </p>
        <p className="text-micro font-bold uppercase tracking-wide text-success">
          Active inside
        </p>
      </div>
    </div>
  );
}

export function LiveAttendanceCard({ event, attendance, isStudent }: LiveAttendanceCardProps) {
  const present = attendance.present;
  const total = present + attendance.departed;

  return (
    <Card className="sticky top-24">
      <LiveAttendanceHeader />
      <CardContent className="space-y-4 pt-0">
        {/* Current count */}
        <LivePresenceCount location={event.location} present={present} />

        {/* Check-in buttons — hidden for students, who cannot operate the gate terminals */}
        {!isStudent && <EventCheckInButtons eventId={event.id} />}

        {/* Stats */}
        <EventAttendanceStats
          present={present}
          departed={attendance.departed}
          total={total}
        />

        {/* Live Activity Feed */}
        <div className="border-t pt-3">
          <LiveActivityFeed
            eventId={event.id}
            initialRecent={attendance.recent}
          />
        </div>
      </CardContent>
    </Card>
  );
}
