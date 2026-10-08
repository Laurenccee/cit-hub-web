"use client";

import { cn } from "@/lib/utils";
import { DeskCheckin } from "../types";
import StudentAvatar from "./StudentAvatar";

export default function CheckinLogList({ checkins }: { checkins: DeskCheckin[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-100">
      <table className="w-full min-w-120 text-sm">
        <thead>
          <tr className="bg-slate-50/70 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            <th className="px-4 py-2.5">Time</th>
            <th className="px-4 py-2.5">Direction</th>
            <th className="px-4 py-2.5">Person</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {checkins.map((row) => (
            <CheckinRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>
      {checkins.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-slate-400">
          No taps logged for this event yet. Scan a card to begin.
        </p>
      )}
    </div>
  );
}

function CheckinRow({ row }: { row: DeskCheckin }) {
  const isIn = Boolean(row.check_in) && !row.check_out;
  const at = new Date(
    (isIn ? row.check_in : row.check_out) ?? row.created_at,
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const name = row.student
    ? `${row.student.first_name} ${row.student.last_name}`
    : "Unknown card";
  const sub = row.student?.student_id ?? "Unregistered";
  const initials = row.student
    ? `${row.student.first_name.charAt(0)}${row.student.last_name.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-500">{at}</td>
      <td className="whitespace-nowrap px-4 py-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
            isIn ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", isIn ? "bg-green-500" : "bg-amber-500")} />
          {isIn ? "In" : "Out"}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <span className="flex items-center gap-2.5">
          <StudentAvatar
            url={row.student?.profile_picture_url}
            name={name}
            initials={initials}
            className="h-8 w-8"
          />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-slate-800">{name}</span>
            <span className="block text-[11px] text-slate-400">{sub}</span>
          </span>
        </span>
      </td>
    </tr>
  );
}
