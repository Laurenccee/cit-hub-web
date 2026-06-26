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

export interface InputFieldProps {
    name: string;
    label: string;
    control: any;
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

export interface ComboboxProps<T> {
    name: string;
    label?: string;
    control: any;
    options: T[];
    valueKey: keyof T; // property used for field value (e.g., 'id')
    labelKey: keyof T; // property displayed to user (e.g., 'name')
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    description?: string;
    error?: string;
    disabled?: boolean;
    isPending?: boolean;
}
