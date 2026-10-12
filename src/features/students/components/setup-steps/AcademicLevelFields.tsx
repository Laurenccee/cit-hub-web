"use client";

import ComboboxField from "@/components/shared/ComboboxField";
import type { Control, FieldValues } from "react-hook-form";
import { SECTIONS, YEAR_LEVELS } from "../../schema/student";

interface AcademicLevelFieldsProps {
  control: Control<FieldValues>;
  isPending: boolean;
}

/** Year level and section pickers, shared by the setup wizard and edit dialog. */
export function AcademicLevelFields({
  control,
  isPending,
}: AcademicLevelFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ComboboxField
        name="yearLevel"
        label="Year Level"
        placeholder="Select year level"
        options={[...YEAR_LEVELS]}
        valueKey="value"
        labelKey="label"
        control={control}
        isPending={isPending}
      />

      <ComboboxField
        name="section"
        label="Section"
        placeholder="Select section"
        options={[...SECTIONS]}
        valueKey="value"
        labelKey="label"
        control={control}
        isPending={isPending}
      />
    </div>
  );
}
