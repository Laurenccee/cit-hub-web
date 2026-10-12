'use client';

import React, { useState } from 'react';
import { Controller, FieldValues } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '../ui/input-group';
import Link from 'next/link';
import { InputFieldProps } from '@/types';
import { ROUTES } from '@/utils/constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { EyeClosedIcon, EyeIcon } from '@hugeicons/core-free-icons';

export default function InputField<TFieldValues extends FieldValues>({
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
}: InputFieldProps<TFieldValues>) {
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
                        <div className="flex justify-between text-foreground">
                            {label && (
                                <FieldLabel className="text-sm sm:text-sm" htmlFor={field.name}>
                                    {label}
                                </FieldLabel>
                            )}
                            {isPassword && forgetPasswordLink && (
                                <Link
                                    href={ROUTES.FORGET_PASSWORD}
                                    className="text-sm hover:text-foreground hover:underline"
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
                                            <HugeiconsIcon icon={EyeIcon} />
                                        ) : (
                                            <HugeiconsIcon icon={EyeClosedIcon} />
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
                            <FieldError className="text-xs font-semibold tracking-[0.2em] text-destructive">
                                {fieldErrorMessage}
                            </FieldError>
                        )}
                    </Field>
                );
            }}
        />
    );
}
