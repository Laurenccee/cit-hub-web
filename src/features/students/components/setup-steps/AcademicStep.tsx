"use client";

import type { Course, Major } from "../../types";
import { AcademicFields } from "./AcademicFields";
import type { Control, FieldValues } from "react-hook-form";

interface AcademicStepProps {
  control: Control<FieldValues>;
  isPending: boolean;
  courses: Course[];
  majors: Major[];
}

export function AcademicStep({
  control,
  isPending,
  courses,
  majors,
}: AcademicStepProps) {
  return (
    <AcademicFields
      control={control}
      isPending={isPending}
      courses={courses}
      majors={majors}
    />
  );
}
