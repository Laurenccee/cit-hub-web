import { createClient } from "@/lib/supabase/server";
import type { QueryResult } from "@/types/action";
import type { Course, Major, Student } from "../types";
import type { DirectoryStudent } from "../types";

const STUDENT_SELECT =
  "*, profiles ( email, role_id ), courses ( id, code, name ), majors ( id, code, name )";

async function fetchStudents(): Promise<QueryResult<Student[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select(STUDENT_SELECT)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching students:", error.message);
    return { success: false, data: [] };
  }

  return { success: true, data: (data ?? []) as Student[] };
}

export async function getStudentDirectory(): Promise<QueryResult<DirectoryStudent[]>> {
  const result = await fetchStudents();

  if (!result.success) {
    return { success: false, data: [] };
  }

  const directory: DirectoryStudent[] = result.data.map((student) => {
    const courseName = student.courses?.name ?? student.courses?.code ?? null;
    const linked = Boolean(student.rfid_uid);
    return {
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      photoUrl: student.profile_picture_url,
      yearLevel: formatYearLevel(student.year_level),
      studentId: student.student_id ?? "—",
      course: courseName ?? "—",
      courseCode: student.courses?.code ?? null,
      major: student.majors?.name ?? null,
      majorId: student.major_id ?? student.majors?.id ?? null,
      majorCode: student.majors?.code ?? null,
      rfidStatus: linked ? "linked" : "unlinked",
      nfcTag: linked ? `NFC-${student.rfid_uid!.slice(-6).toUpperCase()}` : null,
      rfidUid: student.rfid_uid,
      rfidNote: linked ? null : "No credential assigned",
      source: student,
    };
  });

  return { success: true, data: directory };
}

function formatYearLevel(yearLevel?: string | null) {
  const raw = (yearLevel ?? "").trim();
  if (!raw) return "—";
  if (/year/i.test(raw)) return raw;
  return `${raw} Year`;
}

export async function getStudents(): Promise<QueryResult<Student[]>> {
  return fetchStudents();
}

async function getCourses(): Promise<QueryResult<Course[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, code, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching courses:", error.message);
    return { success: false, data: [] };
  }

  return { success: true, data: (data ?? []) as Course[] };
}

async function getMajors(): Promise<QueryResult<Major[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("majors")
    .select("id, code, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching majors:", error.message);
    return { success: false, data: [] };
  }

  return { success: true, data: (data ?? []) as Major[] };
}

export async function getStudentsPageData() {
  const [coursesResult, majorsResult] = await Promise.all([
    getCourses(),
    getMajors(),
  ]);

  return {
    courses: coursesResult.success ? coursesResult.data : [],
    majors: majorsResult.success ? majorsResult.data : [],
  };
}
