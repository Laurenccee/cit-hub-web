'use client';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
};

export default function FormTextField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  icon,
  iconPosition = 'right',
  className,
  disabled,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div
          className={`flex flex-col gap-2${className ? ` ${className}` : ''}`}
        >
          <Label>{label}</Label>
          <InputGroup>
            {icon && iconPosition === 'left' && (
              <InputGroupAddon>{icon}</InputGroupAddon>
            )}
            <InputGroupInput
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
            />
            {icon && iconPosition === 'right' && (
              <InputGroupAddon>{icon}</InputGroupAddon>
            )}
          </InputGroup>
          {fieldState.error && (
            <p className="text-xs text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
