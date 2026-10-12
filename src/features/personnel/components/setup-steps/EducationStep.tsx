'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import InputField from '@/components/shared/InputField';
import { Label } from '@/components/ui/label';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GraduationScrollIcon,
  School01Icon,
  Mortarboard01Icon,
  CalendarIcon,
  X,
} from '@hugeicons/core-free-icons';

interface EducationStepProps {
  control: ReturnType<typeof import('react-hook-form').useForm<any>>['control'];
  isPending: boolean;
}

export function EducationStep({ control, isPending }: EducationStepProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'education' });
  const educationValues = useWatch({ control, name: 'education' });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-medium">Degree {index + 1}</h3>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <HugeiconsIcon icon={X} className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  name={`education.${index}.degree`}
                  label="Degree"
                  placeholder="e.g. Bachelor of Science in IT"
                  control={control}
                  isPending={isPending}
                  leadingIcon={<HugeiconsIcon icon={GraduationScrollIcon} />}
                />

                <InputField
                  name={`education.${index}.institution`}
                  label="Institution"
                  placeholder="e.g. University"
                  control={control}
                  isPending={isPending}
                  leadingIcon={<HugeiconsIcon icon={School01Icon} />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  name={`education.${index}.major`}
                  label="Major / Specialization"
                  placeholder="e.g. Information Technology"
                  control={control}
                  isPending={isPending}
                  leadingIcon={<HugeiconsIcon icon={Mortarboard01Icon} />}
                />

                <InputField
                  name={`education.${index}.yearGraduated`}
                  label="Year Graduated"
                  placeholder="2024"
                  control={control}
                  isPending={isPending}
                  leadingIcon={<HugeiconsIcon icon={CalendarIcon} />}
                />

                <Controller
                  name={`education.${index}.onGoing`}
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="flex h-10 items-center gap-3">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                          aria-label="Currently pursuing"
                        />
                        <span className="text-xs text-muted-foreground">
                          {field.value ? 'Currently pursuing' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto self-start"
          onClick={() =>
            append({
              degree: '',
              major: '',
              institution: '',
              yearGraduated: '',
              onGoing: false,
            })
          }
          disabled={isPending}
        >
          <HugeiconsIcon icon={GraduationScrollIcon} className="w-4 h-4 mr-2" />
          Add Another Degree
        </Button>
      </div>
    </div>
  );
}