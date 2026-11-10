"use client";

import { useTransition } from "react";
import { useForm, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EventSchema, type EventFormData } from "../schema/event";
import { createEventAction } from "../action/create-event";
import { deleteStorageFileAction, uploadEventImageAction } from "@/actions/image";
import type { UseEventFormProps } from "../types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CoverUpload =
  | { success: true; url: string | undefined }
  | { success: false; message: string };

/** Uploads the cover (when one was picked) through the same FormData flow as the other forms. */
async function uploadCoverImage(blob: Blob | null): Promise<CoverUpload> {
  if (!blob) return { success: true, url: undefined };
  const fd = new FormData();
  fd.append("file", blob, "event.jpg");

  const uploadResult = await uploadEventImageAction(fd);
  if (!uploadResult.success) {
    return { success: false, message: uploadResult.message ?? "Failed to upload image." };
  }
  return { success: true, url: uploadResult.url };
}

/** Map server-side field errors back to RHF so they render inline. */
function applyFieldErrors(
  fieldErrors: Record<string, string[]>,
  setError: UseFormSetError<EventFormData>,
) {
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    if (!Array.isArray(messages)) return;
    messages.forEach((message) => {
      setError(field as keyof EventFormData, { type: "server", message: String(message) });
    });
  });
}

async function reportCreateFailure(
  result: { message?: string; fieldErrors?: Record<string, string[]> },
  imageUrl: string | undefined,
  setError: UseFormSetError<EventFormData>,
) {
  // Roll back the uploaded cover image so a failed insert does not
  // leave an orphaned file in storage.
  if (imageUrl) {
    await deleteStorageFileAction(imageUrl, "event-images");
  }
  if (result.fieldErrors) {
    applyFieldErrors(result.fieldErrors, setError);
  }
  toast.error(result.message ?? "Failed to create event");
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}

/**
 * Form hook for the Create Event dialog. Mirrors the pattern of
 * useStudentForm: owns RHF + zodResolver + useTransition + toast + action
 * call. The component becomes a pure presentation layer.
 */
export function useEventForm({ onSuccess, onClose }: UseEventFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<EventFormData>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      categoryId: "",
      imageAlt: "",
      isPublished: false,
      isFeatured: false,
    },
  });

  const { control, handleSubmit, setValue, reset, formState } = form;

  function syncSlug(title: string) {
    setValue("slug", slugify(title), { shouldValidate: false });
  }

  /**
   * Submit handler. Receives a validated EventFormData object from RHF.
   * The cover image is uploaded first through `uploadEventImageAction` (the
   * same FormData flow used by useStudentForm/usePersonnelForm/useNewsForm) and
   * the resulting public URL is passed to the action.
   */
  const onSubmit = (imageBlobRef: React.RefObject<Blob | null>) =>
    handleSubmit((data: EventFormData) => {
      startTransition(async () => {
        try {
          const upload = await uploadCoverImage(imageBlobRef.current);
          if (!upload.success) {
            toast.error(upload.message);
            return;
          }
          const imageUrl = upload.url;

          const result = await createEventAction(data, imageUrl);

          if (!result.success) {
            await reportCreateFailure(result, imageUrl, form.setError);
            return;
          }

          toast.success("Event created successfully!");
          reset();
          onSuccess?.();
          onClose?.();
        } catch (err) {
          toast.error(errorMessage(err));
        }
      });
    });

  return {
    control,
    isPending,
    formState,
    syncSlug,
    onSubmit,
    reset,
  };
}
