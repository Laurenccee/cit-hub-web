"use client";

import InputField from "@/components/shared/InputField";
import ComboboxField from "@/components/shared/ComboboxField";
import { HugeiconsIcon } from "@hugeicons/react";
import { TelephoneIcon } from "@hugeicons/core-free-icons";
import type { Control, FieldValues } from "react-hook-form";
import { Course, Major } from "../../types";
import { AcademicLevelFields } from "./AcademicLevelFields";

interface AcademicFieldsProps {
  control: Control<FieldValues>;
  isPending: boolean;
  courses: Course[];
  majors: Major[];
}

/**
 * Course, major, year level, section, and contact number. Shared by the setup
 * wizard and the edit dialog so both collect the same fields with the same
 * affordances.
 */
export function AcademicFields({
  control,
  isPending,
  courses,
  majors,
}: AcademicFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <ComboboxField
        name="courseId"
        label="Course"
        placeholder="Select course"
        searchPlaceholder="Search courses..."
        options={courses}
        valueKey="id"
        labelKey="name"
        control={control}
        isPending={isPending}
      />

      <ComboboxField
        name="majorId"
        label="Major"
        placeholder="Select major"
        searchPlaceholder="Search majors..."
        options={majors}
        valueKey="id"
        labelKey="name"
        control={control}
        isPending={isPending}
      />

      <AcademicLevelFields control={control} isPending={isPending} />

      <InputField
        name="contactNumber"
        label="Contact Number"
        placeholder="e.g. 09123456789"
        control={control}
        isPending={isPending}
        leadingIcon={<HugeiconsIcon icon={TelephoneIcon} />}
        type="tel"
      />
    </div>
  );
}
