"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Course, DirectoryStudent, Major, StudentTableRowProps } from "../types";
import EditStudentDialog from "./EditStudentDialog";
import PromoteToPioneerButton from "./PromoteToPioneerButton";
import RfidLinkButton from "./RfidLinkButton";
import { cn } from "@/lib/utils";

const avatarPalette = [
  "bg-primary/10 text-primary",
  "bg-secondary text-secondary-foreground",
  "bg-accent text-accent-foreground",
  "bg-muted text-muted-foreground",
  "bg-primary/5 text-primary",
  "bg-muted/70 text-muted-foreground",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return avatarPalette[hash % avatarPalette.length];
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function presenceDot(presence: DirectoryStudent["presence"]) {
  if (presence === "inside") return "bg-success";
  if (presence === "issue") return "bg-warning";
  return "bg-muted-foreground/40";
}

export default function StudentTableRow({
  student: s,
  courses,
  majors,
}: StudentTableRowProps) {
  return (
    <tr className="transition-colors hover:bg-muted/50">
      <td className="px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="relative shrink-0">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-bold",
                !s.photoUrl && avatarColor(`${s.firstName} ${s.lastName}`),
              )}
            >
              {s.photoUrl ? (
                <Image
                  src={s.photoUrl}
                  alt={`${s.firstName} ${s.lastName}`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                initials(s.firstName, s.lastName)
              )}
            </span>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                presenceDot(s.presence),
              )}
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foreground">
              {s.firstName} {s.lastName}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {s.yearLevel}
            </span>
          </span>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <span className="inline-flex rounded-md border border-border bg-card px-2 py-1 font-mono text-micro font-bold text-primary shadow-sm">
          {s.studentId}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{s.course}</p>
        {s.major && (
          <p className="text-xs text-muted-foreground">Major in {s.major}</p>
        )}
        <p className="text-micro text-muted-foreground">{s.college}</p>
      </td>
      <td className="px-4 py-3">
        {s.rfidStatus === "linked" ? (
          <span className="inline-flex max-w-[190px] items-center gap-1.5 truncate rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-micro font-semibold text-success">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
            <span className="truncate">{s.nfcTag ?? "Linked"}</span>
          </span>
        ) : s.rfidStatus === "pending" ? (
          <span className="inline-flex max-w-[190px] items-center gap-1.5 truncate rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-micro font-semibold text-warning">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
            <span className="truncate">{s.nfcTag ?? "Pending"}</span>
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-micro font-medium text-muted-foreground">
            Not linked
          </span>
        )}
        {s.rfidUid && (
          <p className="mt-1 text-micro tracking-wide text-muted-foreground">
            UID: {s.rfidUid}
          </p>
        )}
        {s.rfidNote && (
          <p
            className={cn(
              "mt-1 text-micro font-medium",
              s.rfidStatus === "pending"
                ? "text-warning"
                : "text-muted-foreground",
            )}
          >
            {s.rfidNote}
          </p>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right sm:px-5">
        <span className="inline-flex items-center gap-0.5">
          {s.source ? (
            <>
              <PromoteToPioneerButton student={s.source} />
              <EditStudentDialog
                student={s.source}
                courses={courses}
                majors={majors}
              />
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Edit ${s.firstName} ${s.lastName}`}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <RfidLinkButton
            studentId={s.id}
            studentName={`${s.firstName} ${s.lastName}`}
          />
        </span>
      </td>
    </tr>
  );
}
