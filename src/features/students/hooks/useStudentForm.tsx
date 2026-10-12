"use client";

import { useRef, useTransition, useEffect } from "react";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  StudentFormData,
  StudentSchema,
  UpdateStudentFormData,
  UpdateStudentSchema,
} from "../schema/student";
import { UseStudentFormProps } from "../types";
import { deleteStorageFileAction } from "@/actions/image";
import { uploadPendingAvatar } from "@/lib/avatar";
import { getErrorMessage } from "@/utils/errors";

type StudentFormValues = StudentFormData &
  Partial<Pick<UpdateStudentFormData, "id" | "rfidUid">>;

export function useStudentForm({
  student,
  mode,
  onPendingChange,
  onSuccess,
  submitAction,
  uploadAvatarAction,
}: UseStudentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pendingBlobRef = useRef<Blob | null>(null);

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

  const { control, handleSubmit } = useForm<any>({
    resolver: zodResolver(
      mode === "edit" ? UpdateStudentSchema : StudentSchema,
    ),
    defaultValues,
  });

  const formValues = useWatch({ control });

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const handleFormSubmit: SubmitHandler<StudentFormValues> = async (data) => {
    startTransition(async () => {
      let profilePictureUrl = student?.profile_picture_url || undefined;
      try {
        profilePictureUrl = await uploadPendingAvatar(
          pendingBlobRef.current,
          uploadAvatarAction,
          profilePictureUrl,
        );

        const result = await submitAction({
          ...data,
          profilePictureUrl,
          ...(mode === "edit" && student ? { id: student.id } : {}),
        });

        if (!result.success) {
          toast.error(result.message ?? "Failed to save student profile.");
          return;
        }

        toast.success(
          mode === "edit"
            ? "Student updated successfully."
            : "Student profile created successfully!",
        );
        onSuccess?.();
        if (mode === "setup") router.replace("/home");
      } catch (error) {
        if (profilePictureUrl && mode === "setup") {
          await deleteStorageFileAction(profilePictureUrl, "avatar-images");
        }
        toast.error(getErrorMessage(error, "An unexpected error occurred."));
      }
    });
  };

  return {
    control,
    isPending,
    formValues,
    pendingBlobRef,
    onSubmit: handleSubmit(handleFormSubmit),
  };
}
