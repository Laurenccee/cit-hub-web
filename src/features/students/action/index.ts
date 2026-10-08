"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/utils/constants/routes";
import { ROLES } from "@/utils/constants/roles";
import { deleteStorageFileAction } from "@/actions/image";
import {
  PromoteToPioneerData,
  PromoteToPioneerSchema,
  RegisterStudentData,
  RegisterStudentSchema,
  StudentFormData,
  StudentSchema,
  UpdateStudentSchema,
} from "../schema/student";
import { StudentSubmitPayload } from "../types";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Students are managed by Admins and Pioneers (role_id 0 and 3). This is intentionally
 * separate from `getAuthorizedUser` (Admin/Faculty), which is unrelated to this feature.
 */
async function getAuthorizedStudentManager() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", user.id)
    .single();

  if (profile?.role_id !== ROLES.ADMIN && profile?.role_id !== ROLES.PIONEER) {
    return null;
  }

  return { user, roleId: profile.role_id as number };
}

export async function registerStudentAction(values: RegisterStudentData) {
  const authorized = await getAuthorizedStudentManager();
  if (!authorized) return { success: false, message: "Unauthorized." };

  const validatedFields = RegisterStudentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const data = validatedFields.data;
  // Every pre-registered account starts as an ordinary Student; Pioneer status is granted
  // later by an Admin from the Students directory once the student has set up their profile.
  const supabaseAdmin = createAdminClient();

  try {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: "P@ssw0rd!",
        email_confirm: false,
      });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || "Failed to create authentication user.",
      };
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: data.email,
        role_id: ROLES.STUDENT,
        change_password: true,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { success: false, message: profileError.message };
    }

    const { error: emailError } = await supabaseAdmin.auth.resend({
      type: "signup",
      email: data.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${ROUTES.SIGN_IN}`,
      },
    });

    if (emailError) {
      console.error("Verification email failed to send:", emailError.message);
      return {
        success: false,
        message:
          emailError.message ||
          "User created but failed to send verification email.",
      };
    }

    revalidatePath(ROUTES.STUDENTS);
    return { success: true };
  } catch (error) {
    console.error("Student Registration Action Error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function promoteToPioneerAction(values: PromoteToPioneerData) {
  const authorized = await getAuthorizedStudentManager();
  if (!authorized) return { success: false, message: "Unauthorized." };

  // Only Admins may grant Pioneer (student officer) privileges.
  if (authorized.roleId !== ROLES.ADMIN) {
    return { success: false, message: "Only Admins can register Pioneers." };
  }

  const validatedFields = PromoteToPioneerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const data = validatedFields.data;
  const supabaseAdmin = createAdminClient();

  try {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role_id: ROLES.PIONEER })
      .eq("id", data.id);
    if (profileError) throw profileError;

    revalidatePath(ROUTES.STUDENTS);
    return { success: true, message: "Student registered as Pioneer." };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to register student as Pioneer."),
    };
  }
}

export async function revokePioneerAction(id: string) {
  const authorized = await getAuthorizedStudentManager();
  if (!authorized) return { success: false, message: "Unauthorized." };

  if (authorized.roleId !== ROLES.ADMIN) {
    return {
      success: false,
      message: "Only Admins can revoke Pioneer status.",
    };
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role_id: ROLES.STUDENT })
      .eq("id", id);
    if (profileError) throw profileError;

    revalidatePath(ROUTES.STUDENTS);
    return { success: true, message: "Pioneer status revoked." };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to revoke Pioneer status."),
    };
  }
}

export async function studentSetupAction(values: StudentFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized." };

  const validatedFields = StudentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const data = validatedFields.data;

  try {
    const { error } = await supabase.from("students").insert({
      id: user.id,
      student_id: data.studentId,
      first_name: data.firstName,
      last_name: data.lastName,
      course_id: data.courseId,
      major_id: data.majorId || null,
      year_level: data.yearLevel,
      section: data.section,
      contact_number: data.contactNumber ?? null,
      profile_picture_url: data.profilePictureUrl ?? null,
    });

    if (error) throw error;

    revalidatePath(ROUTES.STUDENT_SETUP);
    return {
      success: true,
      message: "Student profile setup completed successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "An unexpected database error occurred."),
    };
  }
}

export async function updateStudentAction(values: StudentSubmitPayload) {
  const authorized = await getAuthorizedStudentManager();
  if (!authorized) return { success: false, message: "Unauthorized." };

  const validatedFields = UpdateStudentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const data = validatedFields.data;
  const supabase = await createClient();

  const payload = {
    student_id: data.studentId,
    first_name: data.firstName,
    last_name: data.lastName,
    course_id: data.courseId,
    major_id: data.majorId || null,
    year_level: data.yearLevel,
    section: data.section,
    contact_number: data.contactNumber ?? null,
    profile_picture_url: data.profilePictureUrl ?? null,
    rfid_uid: data.rfidUid ? data.rfidUid.trim() : null,
    updated_by: authorized.user.id,
  };

  try {
    const { error } = await supabase
      .from("students")
      .update(payload)
      .eq("id", data.id);
    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          message:
            "That student number or RFID card is already linked to another student.",
        };
      }
      throw error;
    }

    revalidatePath(ROUTES.STUDENTS);
    return { success: true, message: "Student profile updated successfully." };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "An unexpected database error occurred."),
    };
  }
}

export async function linkStudentRfidAction(
  studentId: string,
  rfidUid: string,
) {
  const authorized = await getAuthorizedStudentManager();
  if (!authorized) return { success: false, message: "Unauthorized." };

  const trimmed = rfidUid.trim();
  if (!trimmed) return { success: false, message: "RFID UID is required." };

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("students")
      .update({ rfid_uid: trimmed, updated_by: authorized.user.id })
      .eq("id", studentId);

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          message: "That RFID card is already linked to another student.",
        };
      }
      throw error;
    }

    revalidatePath(ROUTES.STUDENTS);
    return { success: true, message: "RFID card linked successfully." };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to link RFID card."),
    };
  }
}

export async function deleteStudentAction(id: string) {
  const authorized = await getAuthorizedStudentManager();
  if (!authorized) return { success: false, message: "Unauthorized." };

  if (authorized.user.id === id) {
    return {
      success: false,
      message: "You cannot delete your own account from here.",
    };
  }

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  try {
    const { data: studentRow } = await supabase
      .from("students")
      .select("profile_picture_url")
      .eq("id", id)
      .single();

    if (studentRow?.profile_picture_url) {
      const storageResult = await deleteStorageFileAction(
        studentRow.profile_picture_url,
        "avatar-images",
      );
      if (!storageResult.success) {
        console.error("Storage deletion failed:", storageResult.message);
      }
    }

    const { error: studentError } = await supabase
      .from("students")
      .delete()
      .eq("id", id);
    if (studentError) throw studentError;

    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);
    if (profileError) throw profileError;

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw authError;

    revalidatePath(ROUTES.STUDENTS);
    return { success: true, message: "Student successfully deleted." };
  } catch (error) {
    console.error("Deletion Failed:", error);
    return {
      success: false,
      message: getErrorMessage(error, "An unexpected error occurred."),
    };
  }
}
