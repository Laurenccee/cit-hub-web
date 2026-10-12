"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EventSchema, type EventFormData } from "../schema/event";
import { createEventAction } from "../action";
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

  const { control, handleSubmit, watch, setValue, reset, formState } = form;

  // Derive slug from title (display-only — user cannot edit it).
  const titleValue = watch("title");

  function syncSlug(title: string) {
    setValue("slug", slugify(title), { shouldValidate: false });
  }

  /**
   * Submit handler. Receives a validated EventFormData object from RHF.
   * The cover image is uploaded first through `uploadEventImageAction` (the
   * same FormData flow used by useStudentForm/usePersonnelForm/NewsForm) and
   * the resulting public URL is passed to the action.
   */
  const onSubmit = (imageBlobRef: React.RefObject<Blob | null>) =>
    handleSubmit((data: EventFormData) => {
      startTransition(async () => {
        try {
          let imageUrl: string | undefined;

          const blob = imageBlobRef.current;
          if (blob) {
            const fd = new FormData();
            fd.append("file", blob, "event.jpg");

            const uploadResult = await uploadEventImageAction(fd);
            if (!uploadResult.success) {
              toast.error(uploadResult.message ?? "Failed to upload image.");
              return;
            }
            imageUrl = uploadResult.url;
          }

          const result = await createEventAction(data, imageUrl);

          if (!result.success) {
            // Roll back the uploaded cover image so a failed insert does not
            // leave an orphaned file in storage.
            if (imageUrl) {
              await deleteStorageFileAction(imageUrl, "event-images");
            }
            // Map server-side field errors back to RHF so they render inline.
            if (result.fieldErrors) {
              Object.entries(result.fieldErrors).forEach(([field, messages]) => {
                if (Array.isArray(messages)) {
                  messages.forEach((message) => {
                    form.setError(field as keyof EventFormData, {
                      type: "server",
                      message: String(message),
                    });
                  });
                }
              });
            }
            toast.error(result.message ?? "Failed to create event");
            return;
          }

          toast.success("Event created successfully!");
          reset();
          onSuccess?.();
          onClose?.();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Something went wrong";
          toast.error(message);
        }
      });
    });

  return {
    control,
    isPending,
    formState,
    watch,
    titleValue,
    syncSlug,
    onSubmit,
    reset,
  };
}
