"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeskStudent, LastTapResult } from "../types";
import { collegeIdentityFromCourse } from "../utils";

interface VerifiedIdCardProps {
  result: LastTapResult | null;
}

function formatYearStatus(yearLevel?: string | null) {
  const raw = (yearLevel ?? "").trim();
  if (!raw) return "—";
  if (/year/i.test(raw)) return raw;
  return `${raw} Year`;
}

function fullName(student: DeskStudent) {
  return `${student.first_name} ${student.last_name}`.trim() || "Unnamed Student";
}

export default function VerifiedIdCard({ result }: VerifiedIdCardProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const student: DeskStudent | null = result?.student ?? null;
  const name = student ? fullName(student) : "";
  const initials = student
    ? `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase()
    : "";
  const college = student ? collegeIdentityFromCourse(student.course_name).label : "";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Card header band */}
      <div className="flex items-center gap-2.5 bg-primary px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-warning/60 bg-primary text-sm font-black text-warning">
          CIT
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-micro font-bold tracking-[0.08em] text-warning">
            CEBU INSTITUTE OF TECHNOLOGY - UNIVERSITY
          </span>
          <span className="block font-serif text-base font-bold tracking-wide text-primary-foreground">
            STUDENT IDENTIFICATION CARD
          </span>
        </span>
        <span className="hidden shrink-0 items-center gap-1 rounded bg-warning px-1.5 py-1 text-micro font-black tracking-wider text-warning-foreground sm:inline-flex">
          NFC ENCRYPTED
        </span>
      </div>

      {!result ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted">
            <ScanLine className="h-6 w-6 text-muted-foreground/60" />
          </span>
          <p className="text-sm font-bold text-muted-foreground">Awaiting scan</p>
          <p className="max-w-60 text-xs leading-relaxed text-muted-foreground">
            Tap a card, simulate a tap, or type a student ID to verify an identity.
          </p>
        </div>
      ) : !student ? (
        <div className="px-4 py-4">
          <div className="flex gap-4">
            <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-3xl font-black text-destructive/40">
              ?
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-micro font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Scan Result
              </p>
              <p className="font-serif text-xl font-black leading-tight text-destructive">
                Unknown Card
              </p>
              <p className="mt-2 text-micro font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Scanned Identifier
              </p>
              <p className="truncate font-mono text-sm font-bold text-primary">
                {result.identifier}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                No matching student record. Register this card in the student
                directory, then tap again.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="flex gap-4">
            {/* Photo */}
            <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
              {student.profile_picture_url && !photoFailed ? (
                <Image
                  src={student.profile_picture_url}
                  alt={name}
                  fill
                  sizes="112px"
                  className="object-cover"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-primary/5 text-2xl font-black text-primary">
                  {initials || "?"}
                </span>
              )}
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-success px-1.5 py-0.5 text-micro font-black tracking-wide text-success-foreground shadow">
                VALID {new Date().getFullYear()}
              </span>
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <p className="text-micro font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Full Name
              </p>
              <p className="truncate font-serif text-xl font-black leading-tight text-foreground">
                {name}
              </p>

              <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="min-w-0">
                  <p className="text-micro font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Student ID No.
                  </p>
                  <p className="truncate font-mono text-sm font-bold text-primary">
                    {student.student_id ?? "—"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-micro font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Year Status
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {formatYearStatus(student.year_level)}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-micro font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Degree Program
                </p>
                <p className="truncate text-sm font-bold text-foreground">
                  {student.course_name ?? student.major_name ?? "—"}
                </p>
                {college && (
                  <p className="truncate text-micro text-muted-foreground">{college}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer strip */}
      <div
        className={cn(
          "flex items-center justify-center gap-1.5 border-t px-4 py-2.5 text-center text-xs font-semibold",
          !result && "border-border bg-muted/50 text-muted-foreground",
          result?.tone === "success" && "border-success/20 bg-success/10 text-success",
          result?.tone === "warning" && "border-warning/20 bg-warning/10 text-warning",
          result?.tone === "error" && "border-destructive/20 bg-destructive/10 text-destructive",
          result?.tone === "queued" && "border-primary/20 bg-primary/10 text-primary",
        )}
      >
        <BadgeCheck className="h-4 w-4 shrink-0" />
        {result ? result.message : "No attendee tapped yet this session"}
      </div>
    </div>
  );
}
