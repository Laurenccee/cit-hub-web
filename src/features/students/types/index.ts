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

export type StudentDepartment = "CCS" | "COE" | "CBA" | "CAS" | "OTHER";

export type RfidStatus = "linked" | "pending" | "unlinked";

export interface DirectoryStudent {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  yearLevel: string;
  standing: string;
  studentId: string;
  course: string;
  major?: string | null;
  college: string;
  department: StudentDepartment;
  rfidStatus: RfidStatus;
  nfcTag?: string | null;
  rfidUid?: string | null;
  rfidNote?: string | null;
  presence: "inside" | "outside" | "issue";
  source?: Student | null;
}

export interface StudentFormProps {
  id?: string;
  mode: "setup" | "edit";
  student?: Student;
  onPendingChange?: (isPending: boolean) => void;
  onSuccess?: () => void;
}

export interface StudentActionResult {
  success: boolean;
  message?: string;
}

export interface UploadActionResult {
  success: boolean;
  message?: string;
  url?: string;
}

export interface UseStudentFormProps {
  student?: Student;
  mode: "setup" | "edit";
  onPendingChange?: (isPending: boolean) => void;
  onSuccess?: () => void;
  submitAction: (data: any) => Promise<StudentActionResult>;
  uploadAvatarAction: (
    formData: FormData,
    oldUrl?: string | null,
  ) => Promise<UploadActionResult>;
}
