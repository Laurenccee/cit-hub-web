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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Card header band */}
      <div className="flex items-center gap-2.5 bg-[#8B1A1A] px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-[#8B1A1A] text-sm font-black text-amber-300">
          CIT
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[10px] font-bold tracking-[0.08em] text-amber-200">
            CEBU INSTITUTE OF TECHNOLOGY - UNIVERSITY
          </span>
          <span className="block font-serif text-base font-bold tracking-wide text-white">
            STUDENT IDENTIFICATION CARD
          </span>
        </span>
        <span className="hidden shrink-0 items-center gap-1 rounded bg-amber-400 px-1.5 py-1 text-[9px] font-black tracking-wider text-[#5c0e0e] sm:inline-flex">
          NFC ENCRYPTED
        </span>
      </div>

      {!result ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
            <ScanLine className="h-6 w-6 text-slate-300" />
          </span>
          <p className="text-sm font-bold text-slate-600">Awaiting scan</p>
          <p className="max-w-60 text-xs leading-relaxed text-slate-400">
            Tap a card, simulate a tap, or type a student ID to verify an identity.
          </p>
        </div>
      ) : !student ? (
        <div className="px-4 py-4">
          <div className="flex gap-4">
            <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-3xl font-black text-red-300">
              ?
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Scan Result
              </p>
              <p className="font-serif text-xl font-black leading-tight text-red-700">
                Unknown Card
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Scanned Identifier
              </p>
              <p className="truncate font-mono text-[13px] font-bold text-[#8B1A1A]">
                {result.identifier}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
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
            <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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
                <span className="flex h-full w-full items-center justify-center bg-[#8B1A1A]/5 text-2xl font-black text-[#8B1A1A]">
                  {initials || "?"}
                </span>
              )}
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-green-600 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white shadow">
                VALID {new Date().getFullYear()}
              </span>
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Full Name
              </p>
              <p className="truncate font-serif text-xl font-black leading-tight text-slate-900">
                {name}
              </p>

              <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Student ID No.
                  </p>
                  <p className="truncate font-mono text-[13px] font-bold text-[#8B1A1A]">
                    {student.student_id ?? "—"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Year Status
                  </p>
                  <p className="truncate text-[13px] font-semibold text-slate-700">
                    {formatYearStatus(student.year_level)}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Degree Program
                </p>
                <p className="truncate text-[13px] font-bold text-slate-800">
                  {student.course_name ?? student.major_name ?? "—"}
                </p>
                {college && (
                  <p className="truncate text-[11px] text-slate-400">{college}</p>
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
          !result && "border-slate-100 bg-slate-50/60 text-slate-400",
          result?.tone === "success" && "border-green-100 bg-green-50/60 text-green-700",
          result?.tone === "warning" && "border-amber-100 bg-amber-50/60 text-amber-700",
          result?.tone === "error" && "border-red-100 bg-red-50/60 text-red-700",
          result?.tone === "queued" && "border-sky-100 bg-sky-50/60 text-sky-700",
        )}
      >
        <BadgeCheck className="h-4 w-4 shrink-0" />
        {result ? result.message : "No attendee tapped yet this session"}
      </div>
    </div>
  );
}
