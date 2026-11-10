'use client';

import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import Link from 'next/link';
import { ROUTES } from '@/utils/constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { EyeClosedIcon, EyeIcon } from '@hugeicons/core-free-icons';

export interface InputFieldProps<TFieldValues extends FieldValues = FieldValues> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    label: string;
    isPending?: boolean;
    type?: string;
    placeholder?: string;
    description?: string;
    error?: string;
    forgetPasswordLink?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FieldHeader({
    label,
    htmlFor,
    showForgotLink,
}: {
    label: string;
    htmlFor: string;
    showForgotLink: boolean;
}) {
    return (
        <div className="flex justify-between text-foreground">
            {label && (
                <FieldLabel className="text-sm sm:text-sm" htmlFor={htmlFor}>
                    {label}
                </FieldLabel>
            )}
            {showForgotLink && (
                <Link href={ROUTES.FORGET_PASSWORD} className="text-sm hover:text-foreground hover:underline">
                    Forgot password?
                </Link>
            )}
        </div>
    );
}

function PasswordToggleAddon({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
    return (
        <InputGroupAddon align="inline-end">
            <InputGroupButton type="button" tabIndex={-1} className="pr-0.5 hover:bg-transparent" onClick={onToggle}>
                <HugeiconsIcon icon={visible ? EyeIcon : EyeClosedIcon} />
            </InputGroupButton>
        </InputGroupAddon>
    );
}

function TrailingAddon({
    isPassword,
    showPassword,
    onToggle,
    trailingIcon,
}: {
    isPassword: boolean;
    showPassword: boolean;
    onToggle: () => void;
    trailingIcon?: React.ReactNode;
}) {
    if (isPassword) return <PasswordToggleAddon visible={showPassword} onToggle={onToggle} />;
    return (
        trailingIcon && (
            <InputGroupAddon align="inline-end" className="text-muted-foreground/60">
                {trailingIcon}
            </InputGroupAddon>
        )
    );
}

function LeadingAddon({ leadingIcon }: { leadingIcon?: React.ReactNode }) {
    if (!leadingIcon) return null;
    return <InputGroupAddon className="text-muted-foreground/60">{leadingIcon}</InputGroupAddon>;
}

function getTypeProps(isPassword: boolean, showPassword: boolean, type: string) {
    return {
        type: isPassword && showPassword ? 'text' : type,
        autoComplete: isPassword ? 'current-password' : undefined,
    };
}

function FieldMessages({ description, errorMessage }: { description?: string; errorMessage?: string }) {
    return (
        <>
            {description && (
                <FieldDescription className="text-muted-foreground text-xs tracking-spaced">
                    {description}
                </FieldDescription>
            )}
            {errorMessage && (
                <FieldError className="text-xs font-semibold tracking-spaced text-destructive">
                    {errorMessage}
                </FieldError>
            )}
        </>
    );
}

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
    onChange,
    ...rest
}: InputFieldProps<TFieldValues>) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const togglePassword = () => setShowPassword((v) => !v);
    const typeProps = getTypeProps(isPassword, showPassword, type);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldHeader
                        label={label}
                        htmlFor={field.name}
                        showForgotLink={isPassword && !!forgetPasswordLink}
                    />

                    <InputGroup className="transition-all">
                        <InputGroupInput
                            {...field}
                            onChange={(e) => {
                                field.onChange(e);
                                onChange?.(e);
                            }}
                            type={typeProps.type}
                            autoComplete={typeProps.autoComplete}
                            placeholder={rest.placeholder}
                            disabled={isPending || disabled}
                            className="placeholder:text-muted-foreground tracking-wide"
                            aria-invalid={fieldState.invalid}
                            readOnly={readOnly || disabled}
                        />
                        <LeadingAddon leadingIcon={leadingIcon} />
                        <TrailingAddon
                            isPassword={isPassword}
                            showPassword={showPassword}
                            onToggle={togglePassword}
                            trailingIcon={trailingIcon}
                        />
                    </InputGroup>

                    <FieldMessages description={description} errorMessage={error || fieldState.error?.message} />
                </Field>
            )}
        />
    );
}
