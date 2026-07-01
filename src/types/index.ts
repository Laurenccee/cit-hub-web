import { Control, FieldValues, Path } from 'react-hook-form';

export interface EventItemProps {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    imageAlt: string;
    date: string;
    startTime: string;
    endTime: string;
    slug: string;
}
export interface ScheduleItemProps {
    id: string;
    class: string;
    type: 'Lecture' | 'Lab';
    room: string;
    course: string;
    major: string;
    year: string;
    section: string;
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    startTime: string;
    endTime: string;
    status: 'Ongoing' | 'Upcoming' | 'Done' | 'Cancelled';
}

export interface InputFieldProps<TFieldValues extends FieldValues = FieldValues> {
    name: Path<TFieldValues>; // Updated from string
    control: Control<TFieldValues>; // Updated from any
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

export interface ComboboxProps<TData, TFieldValues extends FieldValues = FieldValues> {
    name: Path<TFieldValues>; // Updated from string
    control: Control<TFieldValues>; // Updated from any
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
}

export interface SwitchToggleProps<TFieldValues extends FieldValues = FieldValues> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface ImageDropzoneProps {
    variant?: 'avatar' | 'news';
    onFile?: (blob: Blob | null) => void;
    initialUrl?: string;
}
