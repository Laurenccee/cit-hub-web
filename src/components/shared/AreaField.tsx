'use client';

import { Controller, FieldValues } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '../ui/input-group';
import { InputFieldProps } from '@/types';

export default function AreaField<TFieldValues extends FieldValues>({
    name,
    label,
    control,
    isPending = false,
    type = 'text',
    leadingIcon,
    trailingIcon,
    description,
    error,
    forgetPasswordLink,
    ...rest
}: InputFieldProps<TFieldValues>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <div className="text-accent-foreground flex justify-between">
                        {label && (
                            <FieldLabel className="text-sm sm:text-sm" htmlFor={field.name}>
                                {label}
                            </FieldLabel>
                        )}
                    </div>

                    <InputGroup className="transition-all">
                        <InputGroupTextarea
                            {...field}
                            placeholder={rest.placeholder}
                            disabled={isPending}
                            className="placeholder:text-muted-foreground tracking-wide"
                            aria-invalid={fieldState.invalid}
                        />
                        {leadingIcon && (
                            <InputGroupAddon className="text-muted-foreground/60">{leadingIcon}</InputGroupAddon>
                        )}
                        {trailingIcon && (
                            <InputGroupAddon align="inline-end" className="text-muted-foreground/60">
                                {trailingIcon}
                            </InputGroupAddon>
                        )}
                    </InputGroup>

                    {description && (
                        <FieldDescription className="text-muted-foreground text-xs tracking-[0.2em]">
                            {description}
                        </FieldDescription>
                    )}
                    {error && (
                        <FieldError className="font-mono text-xs font-semibold tracking-[0.2em] text-red-500">
                            {error}
                        </FieldError>
                    )}
                </Field>
            )}
        />
    );
}
