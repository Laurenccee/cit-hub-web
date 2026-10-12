"use client";

import InputField from "@/components/shared/InputField";
import { HugeiconsIcon } from "@hugeicons/react";
import { IdIcon, UserIcon } from "@hugeicons/core-free-icons";
import type { Control, FieldValues } from "react-hook-form";

interface IdentityFieldsProps {
  control: Control<FieldValues>;
  isPending: boolean;
  /** Field name for the identifier input, e.g. "employeeId" or "studentId". */
  idName: string;
  /** Label for the identifier input, e.g. "Employee ID". */
  idLabel: string;
  /** Placeholder for the identifier input. */
  idPlaceholder: string;
}

/**
 * Shared identification block: the role-specific ID field plus first/last
 * name. Personnel use an Employee ID, students a Student ID; everything else
 * is identical.
 */
export function IdentityFields({
  control,
  isPending,
  idName,
  idLabel,
  idPlaceholder,
}: IdentityFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <InputField
        name={idName}
        label={idLabel}
        placeholder={idPlaceholder}
        control={control}
        isPending={isPending}
        leadingIcon={<HugeiconsIcon icon={IdIcon} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          name="firstName"
          label="First Name"
          placeholder="Juan"
          control={control}
          isPending={isPending}
          leadingIcon={<HugeiconsIcon icon={UserIcon} />}
        />

        <InputField
          name="lastName"
          label="Last Name"
          placeholder="Dela Cruz"
          control={control}
          isPending={isPending}
          leadingIcon={<HugeiconsIcon icon={UserIcon} />}
        />
      </div>
    </div>
  );
}
