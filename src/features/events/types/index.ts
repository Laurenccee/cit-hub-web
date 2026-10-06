export interface EventCategory {
    id: string;
    label: string;
    color?: string;
}

export interface EventItem {
    id: string;
    title: string;
    description?: string;
    content?: string;
    image_url?: string;
    image_alt?: string;
    slug: string;
    category_id?: string;
    is_published: boolean;
    is_featured: boolean;
    start_date: string;
    end_date?: string;
    location?: string;
    created_at: string;
    updated_at: string;
    category?: {
        label: string;
        color?: string;
    } | null;
    organizer?: string;
    host?: string;
    cover?: string;
    capacity_label?: string;
    capacity_filled?: number;
    capacity_total?: number;
    capacity_unit?: string;
}

export interface EventAttendanceRecord {
    id: string;
    event_id: string;
    check_in?: string | null;
    check_out?: string | null;
    /** UUID foreign key to students.id */
    student_id?: string | null;
    created_at: string;
}

export interface DeskCheckin extends EventAttendanceRecord {
    student?: {
        first_name: string;
        last_name: string;
        student_id: string | null;
        profile_picture_url: string | null;
    } | null;
}

export interface EventAttendance {
    present: number;
    departed: number;
    total: number;
    recent: EventAttendanceRecord[];
}

export interface EventCardProps {
    event: EventItem;
    variant?: 'featured' | 'grid' | 'list';
    priority?: boolean;
    categories: EventCategory[];
}

// ---------------------------------------------------------------------------
// Attendance / check-in types (moved from action/index.ts)
// ---------------------------------------------------------------------------

export interface DeskCheckinRecord {
    id: string;
    event_id: string;
    check_in: string | null;
    check_out: string | null;
    student_id: string | null;
    created_at: string;
}

export interface DeskCheckinResult {
    success: boolean;
    message: string;
    student?: DeskStudent | null;
    record?: DeskCheckinRecord | null;
    alreadyInside?: boolean;
    noActiveVisit?: boolean;
}

export interface OpenVisitMessages {
    /** They have an open visit, but it belongs to this event. */
    sameEvent: string;
    /** They have an open visit at a different event. */
    otherEvent: (title: string) => string;
    /** They have no open visit at all. */
    none: string;
}

export type ScanState =
    | { kind: 'idle' }
    | { kind: 'processing'; uid: string }
    | { kind: 'success'; message: string; direction: 'in' | 'out' }
    | { kind: 'warning'; message: string }
    | { kind: 'error'; message: string };

// ---------------------------------------------------------------------------
// Form / hook prop types
// ---------------------------------------------------------------------------

export interface CreateEventResult {
    success: boolean;
    eventId?: string;
    error?: string;
    fieldErrors?: Record<string, string[]>;
}

export interface UseEventFormProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

export interface EventFormProps {
    onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// DeskStudent (re-exported from action/index for colocation; components should
// import from types, not from action)
// ---------------------------------------------------------------------------
export interface DeskStudent {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string | null;
    profile_picture_url: string | null;
}