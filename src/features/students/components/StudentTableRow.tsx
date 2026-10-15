"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentTableRowProps } from "../types";
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
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foreground">
              {s.firstName} {s.lastName}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {s.yearLevel}
              {s.courseCode ? ` • ${s.courseCode}` : ""}
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
      </td>
      <td className="px-4 py-3">
        {s.rfidStatus === "linked" ? (
          <span className="font-mono text-micro text-success">
            UID: {s.rfidUid ?? "Linked"}
          </span>
        ) : (
          <span className="text-micro font-medium text-muted-foreground">Not Linked</span>
        )}
        {s.rfidNote && (
          <p className="mt-1 text-micro font-medium text-muted-foreground">
            {s.rfidNote}
          </p>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right sm:px-5">
        <span className="inline-flex items-center justify-end gap-1">
          {s.source ? (
            <EditStudentDialog
              student={s.source}
              courses={courses}
              majors={majors}
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={`Edit ${s.firstName} ${s.lastName}`}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <RfidLinkButton
            studentId={s.id}
            studentName={`${s.firstName} ${s.lastName}`}
          />
          {s.source && <PromoteToPioneerButton student={s.source} />}
        </span>
      </td>
    </tr>
  );
}
