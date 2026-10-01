import { createClient } from "@/lib/supabase/server";
import { Course, Major, Student } from "../types";

export async function getStudents(): Promise<{
  success: boolean;
  data: Student[];
}> {
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

export async function getCourses(): Promise<{
  success: boolean;
  data: Course[];
}> {
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

export async function getMajors(): Promise<{
  success: boolean;
  data: Major[];
}> {
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

export async function getCurrentUserStudent(): Promise<{
  success: boolean;
  data: Student | null;
}> {
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
