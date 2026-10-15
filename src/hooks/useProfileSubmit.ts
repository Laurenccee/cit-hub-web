"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { deleteStorageFileAction } from "@/actions/image";
import { uploadPendingAvatar } from "@/lib/avatar";
import { getErrorMessage } from "@/utils/errors";
import type { ActionResult, UploadActionResult } from "@/types/action";

type ProfileFormMode = "setup" | "edit";

interface UseProfileSubmitProps<P> {
  mode: ProfileFormMode;
  onSuccess?: () => void;
  submitAction: (payload: P) => Promise<ActionResult>;
  uploadAvatarAction: (
    formData: FormData,
    oldUrl?: string | null,
  ) => Promise<UploadActionResult>;
  initialProfilePictureUrl?: string;
  failureMessage: string;
  editSuccessMessage: string;
  createSuccessMessage: string;
  buildPayload: (
    values: FieldValues,
    profilePictureUrl: string | undefined,
  ) => P;
}

/**
 * Shared submit pipeline for the personnel and student profile forms: stages
 * the pending avatar, runs the server action inside a transition, and reports
 * success/failure. Setup flows redirect home on success and clean up an already
 * uploaded avatar if the action throws.
 */
export function useProfileSubmit<P>({
  mode,
  onSuccess,
  submitAction,
  uploadAvatarAction,
  initialProfilePictureUrl,
  failureMessage,
  editSuccessMessage,
  createSuccessMessage,
  buildPayload,
}: UseProfileSubmitProps<P>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pendingBlobRef = useRef<Blob | null>(null);

  const submit = (values: FieldValues) => {
    startTransition(async () => {
      let profilePictureUrl = initialProfilePictureUrl;
      try {
        profilePictureUrl = await uploadPendingAvatar(
          pendingBlobRef.current,
          uploadAvatarAction,
          profilePictureUrl,
        );

        const result = await submitAction(
          buildPayload(values, profilePictureUrl),
        );

        if (!result.success) {
          toast.error(result.message ?? failureMessage);
          return;
        }

        toast.success(
          mode === "edit" ? editSuccessMessage : createSuccessMessage,
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

  return { isPending, pendingBlobRef, submit };
}
