"use client";

import { type BaseSyntheticEvent } from "react";
import { useForm, useWatch, SubmitHandler, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentSchema, UpdateStudentSchema } from "../schema/student";
import { UseStudentFormProps, StudentSubmitPayload } from "../types";
import { useProfileSubmit } from "@/hooks/useProfileSubmit";

export function useStudentForm({
  student,
  mode,
  onSuccess,
  submitAction,
  uploadAvatarAction,
}: UseStudentFormProps) {
  const defaultValues =
    mode === "edit" && student
      ? {
          studentId: student.student_id ?? "",
          firstName: student.first_name,
          lastName: student.last_name,
          courseId: student.course_id ?? "",
          majorId: student.major_id ?? "",
          yearLevel: student.year_level ?? "",
          section: student.section ?? "",
          contactNumber: student.contact_number ?? "",
          rfidUid: student.rfid_uid ?? "",
          profilePictureUrl: student.profile_picture_url ?? "",
        }
      : {
          studentId: "",
          firstName: "",
          lastName: "",
          courseId: "",
          majorId: "",
          yearLevel: "",
          section: "",
          contactNumber: "",
          profilePictureUrl: "",
        };

  // The control is intentionally form-shape agnostic (`FieldValues`) so it can
  // flow into the shared, reusable field components; `handleFormSubmit` narrows
  // the values back to `StudentSubmitPayload` when handing them to the action.
  const { control, handleSubmit } = useForm<FieldValues>({
    resolver: zodResolver(
      mode === "edit" ? UpdateStudentSchema : StudentSchema,
    ) as unknown as Resolver<FieldValues>,
    defaultValues,
  });

  const formValues = useWatch({ control });

  const { isPending, pendingBlobRef, submit } =
    useProfileSubmit<StudentSubmitPayload>({
      mode,
      onSuccess,
      submitAction,
      uploadAvatarAction,
      initialProfilePictureUrl: student?.profile_picture_url || undefined,
      failureMessage: "Failed to save student profile.",
      editSuccessMessage: "Student updated successfully.",
      createSuccessMessage: "Student profile created successfully!",
      buildPayload: (values, profilePictureUrl) => ({
        ...(values as StudentSubmitPayload),
        profilePictureUrl,
        ...(mode === "edit" && student ? { id: student.id } : {}),
      }),
    });

  const handleFormSubmit: SubmitHandler<FieldValues> = (data) => {
    submit(data);
  };

  // Deferred so `handleSubmit` runs at event time, not during render — the
  // submit handler reads `pendingBlobRef`, and refs must not be read in render.
  const onSubmit = (event?: BaseSyntheticEvent) =>
    handleSubmit(handleFormSubmit)(event);

  return {
    control,
    isPending,
    formValues,
    pendingBlobRef,
    onSubmit,
  };
}
