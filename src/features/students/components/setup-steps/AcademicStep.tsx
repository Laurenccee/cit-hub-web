"use client";

import InputField from "@/components/shared/InputField";
import ComboboxField from "@/components/shared/ComboboxField";
import { HugeiconsIcon } from "@hugeicons/react";
import { TelephoneIcon } from "@hugeicons/core-free-icons";
import { Course, Major } from "../../types";
import { SECTIONS, YEAR_LEVELS } from "../../schema/student";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
