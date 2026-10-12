"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/utils/constants/routes";
import { ROLES } from "@/utils/constants/roles";
import { deleteStorageFileAction } from "@/actions/image";
import { getAuthenticatedUser, getAuthorizedUser } from "@/actions";
import { runMutation } from "@/actions/mutation";
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
import { getErrorMessage } from "@/utils/errors";
import { registerUserWithRole, unregisterUser } from "@/actions/auth/register";

/**
 * Students are managed by Admins and Pioneers (role_id 0 and 3) — a narrower
 * set than the default Admin/Faculty gate, so the roles are passed explicitly.
 */
const getAuthorizedStudentManager = () => getAuthorizedUser([ROLES.ADMIN, ROLES.PIONEER]);

export async function registerStudentAction(values: RegisterStudentData) {
  const authorized = await getAuthorizedStudentManager();
  if (!authorized) return { success: false, message: "Unauthorized." };

  const validatedFields = RegisterStudentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const data = validatedFields.data;
  return registerUserWithRole({
    email: data.email,
    roleId: ROLES.STUDENT,
    revalidatePath: ROUTES.STUDENTS,
  });
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
  return runMutation({
    values,
    schema: StudentSchema,
    authorize: getAuthenticatedUser,
    revalidate: [ROUTES.STUDENT_SETUP],
    successMessage: "Student profile setup completed successfully!",
    failureMessage: "An unexpected database error occurred.",
    execute: (data, { supabase, userId }) =>
      supabase.from("students").insert({
        id: userId,
        student_id: data.studentId,
        first_name: data.firstName,
        last_name: data.lastName,
        course_id: data.courseId,
        major_id: data.majorId || null,
        year_level: data.yearLevel,
        section: data.section,
        contact_number: data.contactNumber ?? null,
        profile_picture_url: data.profilePictureUrl ?? null,
      }),
  });
}

export async function updateStudentAction(values: StudentSubmitPayload) {
  return runMutation({
    values,
    schema: UpdateStudentSchema,
    authorize: getAuthorizedStudentManager,
    revalidate: [ROUTES.STUDENTS],
    successMessage: "Student profile updated successfully.",
    failureMessage: "An unexpected database error occurred.",
    conflictMessage:
      "That student number or RFID card is already linked to another student.",
    execute: (data, { supabase, userId }) =>
      supabase
        .from("students")
        .update({
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
          updated_by: userId,
        })
        .eq("id", data.id),
  });
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

    await unregisterUser(id);

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
