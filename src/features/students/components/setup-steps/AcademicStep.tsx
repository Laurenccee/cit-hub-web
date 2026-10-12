"use client";

import { Course, Major } from "../../types";
import { AcademicFields } from "./AcademicFields";

interface AcademicStepProps {
  control: ReturnType<typeof import("react-hook-form").useForm<any>>["control"];
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
