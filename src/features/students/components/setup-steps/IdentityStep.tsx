"use client";

import { IdentityFields } from "@/components/shared/IdentityFields";

interface IdentityStepProps {
  control: ReturnType<typeof import("react-hook-form").useForm<any>>["control"];
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
