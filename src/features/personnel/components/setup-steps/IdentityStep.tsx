'use client';

import InputField from '@/components/shared/InputField';
import { HugeiconsIcon } from '@hugeicons/react';
import { IdIcon, UserIcon } from '@hugeicons/core-free-icons';

interface IdentityStepProps {
  control: ReturnType<typeof import('react-hook-form').useForm<any>>['control'];
  isPending: boolean;
}

export function IdentityStep({ control, isPending }: IdentityStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <InputField
          name="employeeId"
          label="Employee ID"
          placeholder="Enter Employee ID"
          control={control}
          isPending={isPending}
          leadingIcon={<HugeiconsIcon icon={IdIcon} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>
  );
}