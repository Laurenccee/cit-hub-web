"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeskStudent, LastTapResult } from "../types";

interface VerifiedIdCardProps {
  result: LastTapResult | null;
}

const FOOTER_TONE_CLASSES: Record<LastTapResult["tone"] | "idle", string> = {
  idle: "border-border bg-muted/50 text-muted-foreground",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  queued: "border-primary/20 bg-primary/10 text-primary",
};

const LABEL_CLASS =
  "text-micro font-bold uppercase tracking-label-wider text-muted-foreground";

function formatYearStatus(yearLevel?: string | null) {
  const raw = (yearLevel ?? "").trim();
  if (!raw) return "—";
  if (/year/i.test(raw)) return raw;
  return `${raw} Year`;
}

function fullName(student: DeskStudent) {
  return `${student.first_name} ${student.last_name}`.trim() || "Unnamed Student";
}

function getInitials(student: DeskStudent) {
  return `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase();
}

function CardHeaderBand() {
  return (
    <div className="flex items-center gap-2.5 bg-primary px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-warning/60 bg-primary text-sm font-black text-warning">
        CIT
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-micro font-bold tracking-label-tight text-warning">
          CEBU INSTITUTE OF TECHNOLOGY - UNIVERSITY
        </span>
        <span className="block font-serif text-base tracking-wide text-primary-foreground">
          STUDENT IDENTIFICATION CARD
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 rounded bg-warning px-1.5 py-1 text-micro font-black tracking-wider text-warning-foreground sm:inline-flex">
        NFC ENCRYPTED
      </span>
    </div>
  );
}

function AwaitingScan() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted">
        <ScanLine className="h-6 w-6 text-muted-foreground/60" />
      </span>
      <p className="text-sm font-bold text-muted-foreground">Awaiting scan</p>
      <p className="max-w-60 text-xs leading-relaxed text-muted-foreground">
        Tap a card, simulate a tap, or type a student ID to verify an identity.
      </p>
    </div>
  );
}

function UnknownCard({ identifier }: { identifier: string }) {
  return (
    <div className="px-4 py-4">
      <div className="flex gap-4">
        <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-3xl font-black text-destructive/40">
          ?
        </div>
        <div className="min-w-0 flex-1">
          <p className={LABEL_CLASS}>
            Scan Result
          </p>
          <p className="font-serif text-xl leading-tight text-destructive">
            Unknown Card
          </p>
          <p className={cn("mt-2", LABEL_CLASS)}>
            Scanned Identifier
          </p>
          <p className="truncate font-mono text-sm font-bold text-primary">
            {identifier}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            No matching student record. Register this card in the student
            directory, then tap again.
          </p>
        </div>
      </div>
    </div>
  );
}

interface StudentPhotoProps {
  student: DeskStudent;
  photoFailed: boolean;
  onPhotoError: () => void;
}

function StudentPhoto({ student, photoFailed, onPhotoError }: StudentPhotoProps) {
  const showImage = student.profile_picture_url && !photoFailed;

  return (
    <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
      {showImage ? (
        <Image
          src={student.profile_picture_url as string}
          alt={fullName(student)}
          fill
          sizes="112px"
          className="object-cover"
          onError={onPhotoError}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-primary/5 text-2xl font-black text-primary">
          {getInitials(student) || "?"}
        </span>
      )}
      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-success px-1.5 py-0.5 text-micro font-black tracking-wide text-success-foreground shadow">
        VALID {new Date().getFullYear()}
      </span>
    </div>
  );
}

function StudentDetails({ student }: { student: DeskStudent }) {
  return (
    <div className="min-w-0 flex-1">
      <p className={LABEL_CLASS}>
        Full Name
      </p>
      <p className="truncate font-serif text-xl leading-tight text-foreground">
        {fullName(student)}
      </p>

      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2">
        <div className="min-w-0">
          <p className={LABEL_CLASS}>
            Student ID No.
          </p>
          <p className="truncate font-mono text-sm font-bold text-primary">
            {student.student_id ?? "—"}
          </p>
        </div>
        <div className="min-w-0">
          <p className={LABEL_CLASS}>
            Year Status
          </p>
          <p className="truncate text-sm font-semibold text-foreground">
            {formatYearStatus(student.year_level)}
          </p>
        </div>
      </div>

      <div className="mt-2">
        <p className={LABEL_CLASS}>
          Degree Program
        </p>
        <p className="truncate text-sm font-bold text-foreground">
          {student.course_name ?? student.major_name ?? "—"}
        </p>
      </div>
    </div>
  );
}

interface CardBodyProps extends Omit<StudentPhotoProps, "student"> {
  result: LastTapResult | null;
}

function CardBody({ result, photoFailed, onPhotoError }: CardBodyProps) {
  if (!result) return <AwaitingScan />;
  if (!result.student) return <UnknownCard identifier={result.identifier} />;

  return (
    <div className="px-4 py-4">
      <div className="flex gap-4">
        <StudentPhoto
          student={result.student}
          photoFailed={photoFailed}
          onPhotoError={onPhotoError}
        />
        <StudentDetails student={result.student} />
      </div>
    </div>
  );
}

function FooterStrip({ result }: { result: LastTapResult | null }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 border-t px-4 py-2.5 text-center text-xs font-semibold",
        FOOTER_TONE_CLASSES[result?.tone ?? "idle"],
      )}
    >
      <BadgeCheck className="h-4 w-4 shrink-0" />
      {result ? result.message : "No attendee tapped yet this session"}
    </div>
  );
}

export default function VerifiedIdCard({ result }: VerifiedIdCardProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <CardHeaderBand />
      <CardBody
        result={result}
        photoFailed={photoFailed}
        onPhotoError={() => setPhotoFailed(true)}
      />
      <FooterStrip result={result} />
    </div>
  );
}
