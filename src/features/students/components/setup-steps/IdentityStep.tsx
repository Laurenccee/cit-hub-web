"use client";

import { IdentityFields } from "@/components/shared/IdentityFields";
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
      idName="studentId"
      idLabel="Student ID"
      idPlaceholder="e.g. 21-0001"
    />
  );
}
