'use client';

import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils'; // Standard shadcn utility
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { ComboboxProps } from '@/types';
export default function ComboboxField<T>({
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
}: ComboboxProps<T>) {
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
                            <FieldLabel className="text-sm text-accent-foreground mb-1.5 block">{label}</FieldLabel>
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
                                        fieldState.invalid && 'border-red-500 focus-visible:ring-red-500',
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
                                                const labelStr = String(option[labelKey]);
                                                const isSelected = String(field.value) === valueStr;

                                                return (
                                                    <CommandItem
                                                        key={valueStr || index}
                                                        value={labelStr} // used for local client searching
                                                        onSelect={() => {
                                                            // Set form value; toggle off if clicked again
                                                            field.onChange(isSelected ? '' : valueStr);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                isSelected ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                        {labelStr}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {description && (
                            <FieldDescription className="text-muted-foreground text-xs mt-1 block">
                                {description}
                            </FieldDescription>
                        )}

                        {fieldErrorMessage && (
                            <FieldError className="text-xs font-semibold text-red-500 mt-1 block">
                                {fieldErrorMessage}
                            </FieldError>
                        )}
                    </Field>
                );
            }}
        />
    );
}
