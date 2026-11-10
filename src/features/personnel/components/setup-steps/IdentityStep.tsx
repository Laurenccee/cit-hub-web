"use client";

import { IdentityFields } from "@/components/shared/forms/IdentityFields";
import type { Control, FieldValues } from "react-hook-form";

interface IdentityStepProps {
  control: Control<FieldValues>;
  isPending: boolean;
}

export function IdentityStep({ control, isPending }: IdentityStepProps) {
  return (
    <IdentityFields
      control={control}
      isPending={isPending}
      idName="employeeId"
      idLabel="Employee ID"
      idPlaceholder="Enter Employee ID"
    />
  );
}
