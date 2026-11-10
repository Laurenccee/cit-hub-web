'use client';

import InputField from '@/components/shared/forms/InputField';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Control, FieldValues } from 'react-hook-form';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  Linkedin02Icon,
} from '@hugeicons/core-free-icons';

interface SocialStepProps {
  control: Control<FieldValues>;
  isPending: boolean;
}

export function SocialStep({ control, isPending }: SocialStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            name="socialMedia.facebook"
            label="Facebook"
            placeholder="https://www.facebook.com/username"
            control={control}
            isPending={isPending}
            leadingIcon={<HugeiconsIcon icon={FacebookIcon} />}
            type="url"
          />

          <InputField
            name="socialMedia.twitter"
            label="Twitter / X"
            placeholder="https://twitter.com/username"
            control={control}
            isPending={isPending}
            leadingIcon={<HugeiconsIcon icon={TwitterIcon} />}
            type="url"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            name="socialMedia.instagram"
            label="Instagram"
            placeholder="https://www.instagram.com/username"
            control={control}
            isPending={isPending}
            leadingIcon={<HugeiconsIcon icon={InstagramIcon} />}
            type="url"
          />

          <InputField
            name="socialMedia.linkedin"
            label="LinkedIn"
            placeholder="https://www.linkedin.com/in/username"
            control={control}
            isPending={isPending}
            leadingIcon={<HugeiconsIcon icon={Linkedin02Icon} />}
            type="url"
          />
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-xs text-muted-foreground text-center">
          All social links optional. Enter full URLs including https://
        </p>
      </div>
    </div>
  );
}