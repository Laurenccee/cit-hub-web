'use client';

import InputField from '@/components/shared/InputField';
import ComboboxField from '@/components/shared/ComboboxField';
import { HugeiconsIcon } from '@hugeicons/react';
import { OfficeIcon, TelephoneIcon } from '@hugeicons/core-free-icons';
import { Rank, Designation } from '../../types';

interface WorkAssignmentsStepProps {
  control: ReturnType<typeof import('react-hook-form').useForm<any>>['control'];
  isPending: boolean;
  ranks: Rank[];
  designations: Designation[];
}

export function WorkAssignmentsStep({
  control,
  isPending,
  ranks,
  designations,
}: WorkAssignmentsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ComboboxField
            name="rankId"
            label="Rank"
            placeholder="Select rank"
            searchPlaceholder="Search ranks..."
            options={ranks}
            valueKey="id"
            labelKey="name"
            control={control}
            isPending={isPending}
          />

          <ComboboxField
            name="designationId"
            label="Designation"
            placeholder="Select designation"
            searchPlaceholder="Search designations..."
            options={designations}
            valueKey="id"
            labelKey="name"
            control={control}
            isPending={isPending}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            name="office"
            label="Office / Department"
            placeholder="e.g. CIT Department"
            control={control}
            isPending={isPending}
            leadingIcon={<HugeiconsIcon icon={OfficeIcon} />}
          />

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
      </div>
    </div>
  );
}