import { createClient } from "@/lib/supabase/server";
import type { QueryResult } from "@/types/action";
import { Course, Major, Student } from "../types";

export async function getStudents(): Promise<QueryResult<Student[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      "*, profiles ( email, role_id ), courses ( id, code, name ), majors ( id, code, name )",
    )
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching students:", error.message);
    return { success: false, data: [] };
  }

  return { success: true, data: (data ?? []) as Student[] };
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

async function getCurrentUserStudent(): Promise<QueryResult<Student | null>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null };
  }

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Error fetching current user student profile:",
      error.message,
    );
    return { success: false, data: null };
  }

  return { success: true, data: data as Student | null };
}
