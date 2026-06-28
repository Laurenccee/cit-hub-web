'use client';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SwitchToggleProps } from '@/types';

export default function SwitchToggle<TFieldValues extends FieldValues>({
    name,
    control,
    label,
    description,
    disabled = false,
}: SwitchToggleProps<TFieldValues>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm gap-4">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">{label}</Label>
                        {description && <p className="text-xs text-muted-foreground max-w-[90%]">{description}</p>}
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                </div>
            )}
        />
    );
}
