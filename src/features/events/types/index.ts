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
    /** Year level as stored (e.g. "3rd Year"). */
    year_level?: string | null;
    course_code?: string | null;
    course_name?: string | null;
    major_code?: string | null;
    major_name?: string | null;
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
// Attendance / check-in types
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
  | { kind: 'queued'; message: string; direction: 'in' | 'out' }
  | { kind: 'error'; message: string };

/**
 * The latest tap outcome, shown on the gate's ID card whether it succeeded
 * or not — an unknown card or a duplicate tap is still a result the operator
 * needs to see.
 */
export interface LastTapResult {
  /** Resolved student, or null when the identifier matched nobody. */
  student: DeskStudent | null;
  /** Whatever was tapped or typed — card UID or student ID. */
  identifier: string;
  message: string;
  tone: 'success' | 'warning' | 'error' | 'queued';
  at: string;
}

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

export interface DeskStudent {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string | null;
  profile_picture_url: string | null;
  /** Year level as stored (e.g. "3rd Year"). */
  year_level?: string | null;
  course_code?: string | null;
  course_name?: string | null;
  major_code?: string | null;
  major_name?: string | null;
}

/** One row of the desk's local card → student cache. */
export interface RosterSnapshotEntry extends DeskStudent {
  /** Canonical card UID, normalized so lookups match regardless of formatting. */
  uid: string;
}

/** Device-side identity for a tap, used to make replays idempotent. */
export interface DeskTapContext {
  /** Idempotency key generated when the tap happened. */
  clientId?: string;
  /** When the tap happened on the device, which may predate the write. */
  clientTimestamp?: string;
}

export interface RosterSnapshot {
  success: boolean;
  students: RosterSnapshotEntry[];
  syncedAt: string;
}

/** Connectivity + queue state surfaced to the terminals. */
export interface DeskSyncStatus {
  /** `navigator.onLine` — false means taps are queued locally. */
  online: boolean;
  /** Taps waiting to reach the server. */
  pending: number;
  /** True while the queue is being flushed. */
  syncing: boolean;
  /** When the local roster cache was last refreshed. */
  rosterSyncedAt: string | null;
}