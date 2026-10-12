import type { StudentFormData } from "../schema/student";
import type { ActionResult, UploadActionResult } from "@/types/action";

export interface Course {
  id: string;
  code: string;
  name: string;
}

export interface Major {
  id: string;
  code: string;
  name: string;
}

export interface Student {
  id: string;
  student_id?: string | null;
  first_name: string;
  last_name: string;
  course_id?: string | null;
  major_id?: string | null;
  year_level?: string | null;
  section?: string | null;
  contact_number?: string | null;
  profile_picture_url?: string | null;
  rfid_uid?: string | null;
  created_at?: string;
  updated_at?: string;
  profiles?: { email: string; role_id?: number } | null;
  courses?: Course | null;
  majors?: Major | null;
}

export type RfidStatus = "linked" | "pending" | "unlinked";

export interface DirectoryStudent {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  yearLevel: string;
  studentId: string;
  course: string;
  /** Display name from public.majors */
  major?: string | null;
  /** Foreign key to public.majors.id */
  majorId?: string | null;
  /** Code from public.majors — drives the major filter */
  majorCode?: string | null;
  college: string;
  rfidStatus: RfidStatus;
  nfcTag?: string | null;
  rfidUid?: string | null;
  rfidNote?: string | null;
  presence: "inside" | "outside" | "issue";
  source?: Student | null;
}

/**
 * Payload `useStudentForm` hands to `submitAction`. It serves both flows: setup
 * (no `id`) and edit (with `id`). The server action re-validates with zod, which
 * is what enforces `id` for updates.
 */
export type StudentSubmitPayload = StudentFormData & { id?: string };

export interface UseStudentFormProps {
  student?: Student;
  mode: "setup" | "edit";
  onPendingChange?: (isPending: boolean) => void;
  onSuccess?: () => void;
  submitAction: (data: StudentSubmitPayload) => Promise<ActionResult>;
  uploadAvatarAction: (
    formData: FormData,
    oldUrl?: string | null,
  ) => Promise<UploadActionResult>;
}
