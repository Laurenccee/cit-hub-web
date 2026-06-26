'use client';

import React, { useState } from 'react';
import { Controller, Control, FieldValues } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '../ui/input-group';
import Link from 'next/link';
import { EyeIcon, EyeOff, EyeOffIcon } from 'lucide-react';
import { InputFieldProps } from '@/types';

export default function InputField({
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
    readOnly = false,
    disabled = false,
    ...rest
}: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const fieldErrorMessage = error || fieldState.error?.message;

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <div className="text-accent-foreground flex justify-between">
                            {label && (
                                <FieldLabel className="text-sm sm:text-sm" htmlFor={field.name}>
                                    {label}
                                </FieldLabel>
                            )}
                            {isPassword && forgetPasswordLink && (
                                <Link
                                    href={'/forgot-password'}
                                    className="hover:text-foreground text-sm hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <InputGroup className="transition-all">
                            <InputGroupInput
                                {...field}
                                type={isPassword && showPassword ? 'text' : type}
                                autoComplete={isPassword ? 'current-password' : undefined}
                                placeholder={rest.placeholder}
                                disabled={isPending || disabled}
                                className="placeholder:text-muted-foreground tracking-wide"
                                aria-invalid={fieldState.invalid}
                                readOnly={readOnly || disabled}
                            />
                            {leadingIcon && (
                                <InputGroupAddon className="text-muted-foreground/60">{leadingIcon}</InputGroupAddon>
                            )}
                            {isPassword ? (
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        tabIndex={-1}
                                        className="pr-0.5 hover:bg-transparent"
                                        onClick={() => setShowPassword((v) => !v)}
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                        ) : (
                                            <EyeOffIcon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                        )}
                                    </InputGroupButton>
                                </InputGroupAddon>
                            ) : (
                                trailingIcon && (
                                    <InputGroupAddon align="inline-end" className="text-muted-foreground/60">
                                        {trailingIcon}
                                    </InputGroupAddon>
                                )
                            )}
                        </InputGroup>

                        {description && (
                            <FieldDescription className="text-muted-foreground text-xs tracking-[0.2em]">
                                {description}
                            </FieldDescription>
                        )}
                        {fieldErrorMessage && (
                            <FieldError className="text-xs font-semibold tracking-[0.2em] text-red-500">
                                {fieldErrorMessage}
                            </FieldError>
                        )}
                    </Field>
                );
            }}
        />
    );
}
