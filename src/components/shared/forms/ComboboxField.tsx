'use client';

import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

export interface ComboboxProps<TData, TFieldValues extends FieldValues = FieldValues> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    options: TData[];
    valueKey: keyof TData;
    labelKey: keyof TData;
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    description?: string;
    error?: string;
    disabled?: boolean;
    isPending?: boolean;
    onChange?: (value: string) => void;
}

function ComboboxOption({
    valueStr,
    labelStr,
    isSelected,
    onPick,
}: {
    valueStr: string;
    labelStr: string;
    isSelected: boolean;
    onPick: (value: string) => void;
}) {
    return (
        <CommandItem
            value={labelStr} // used for local client searching
            // Set form value; toggle off if clicked again
            onSelect={() => onPick(isSelected ? '' : valueStr)}
        >
            <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
            {labelStr}
        </CommandItem>
    );
}

function ComboboxMessages({ description, errorMessage }: { description?: string; errorMessage?: string }) {
    return (
        <>
            {description && (
                <FieldDescription className="text-muted-foreground text-xs mt-1 block">
                    {description}
                </FieldDescription>
            )}

            {errorMessage && (
                <FieldError className="text-xs font-semibold text-destructive mt-1 block">{errorMessage}</FieldError>
            )}
        </>
    );
}

export default function ComboboxField<TData, TFieldValues extends FieldValues>({
    name,
    label,
    control,
    options = [],
    valueKey,
    labelKey,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results found.',
    description,
    error,
    disabled = false,
    isPending = false,
    onChange,
}: ComboboxProps<TData, TFieldValues>) {
    const [open, setOpen] = useState(false);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const fieldErrorMessage = error || fieldState.error?.message;
                const isControlDisabled = disabled || isPending;

                const selectedOption = options.find((opt) => String(opt[valueKey]) === String(field.value));

                return (
                    <Field data-invalid={fieldState.invalid} className="w-full">
                        {label && (
                            <FieldLabel className="text-sm text-foreground mb-1.5 block">{label}</FieldLabel>
                        )}

                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    disabled={isControlDisabled}
                                    className={cn(
                                        'w-full h-10 justify-between md:text-sm font-normal border-input border-2',
                                        !field.value && 'text-muted-foreground',
                                        fieldState.invalid && 'border-destructive focus-visible:ring-destructive',
                                    )}
                                >
                                    {selectedOption ? String(selectedOption[labelKey]) : placeholder}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-(--radix-popover-trigger-width) my-2 p-0 PopoverContent"
                                align="start"
                            >
                                <Command>
                                    <CommandInput placeholder={searchPlaceholder} />
                                    <CommandList>
                                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                                        <CommandGroup>
                                            {options.map((option, index) => {
                                                const valueStr = String(option[valueKey]);

                                                return (
                                                    <ComboboxOption
                                                        key={valueStr || index}
                                                        valueStr={valueStr}
                                                        labelStr={String(option[labelKey])}
                                                        isSelected={String(field.value) === valueStr}
                                                        onPick={(nextValue) => {
                                                            field.onChange(nextValue);
                                                            onChange?.(nextValue);
                                                            setOpen(false);
                                                        }}
                                                    />
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <ComboboxMessages description={description} errorMessage={fieldErrorMessage} />
                    </Field>
                );
            }}
        />
    );
}
