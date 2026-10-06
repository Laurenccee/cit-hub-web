"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EventSchema, type EventFormData } from "../schema/event";
import { createEventAction } from "../action";
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
   * Image upload is handled separately: the blob is converted to a base64
   * data URL so it can cross the server-action boundary.
   */
  const onSubmit = (imageBlobRef: React.RefObject<Blob | null>) =>
    handleSubmit((data: EventFormData) => {
      startTransition(async () => {
        try {
          let imageBlobDataUrl: string | null = null;

          if (imageBlobRef.current) {
            imageBlobDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error("Failed to read image"));
              reader.readAsDataURL(imageBlobRef.current!);
            });
          }

          const result = await createEventAction(data, imageBlobDataUrl);

          if (!result.success) {
            // Map server-side field errors back to RHF so they render inline.
            if (result.fieldErrors) {
              Object.entries(result.fieldErrors).forEach(([field, messages]) => {
                messages.forEach((message) => {
                  form.setError(field as keyof EventFormData, {
                    type: "server",
                    message,
                  });
                });
              });
            }
            toast.error(result.error ?? "Failed to create event");
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
