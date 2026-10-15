import { type BaseSyntheticEvent } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  SubmitHandler,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PersonnelSchema, UpdatePersonnelSchema } from "../schema/personnel";
import type { PersonnelSubmitPayload, UsePersonnelFormProps } from "../types";
import { useProfileSubmit } from "@/hooks/useProfileSubmit";

function getFirstErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  if ("message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  for (const value of Object.values(error as Record<string, unknown>)) {
    const nested = getFirstErrorMessage(value);
    if (nested) return nested;
  }
  return null;
}

export function usePersonnelForm({
  personnel,
  mode,
  onSuccess,
  submitAction,
  uploadAvatarAction,
}: UsePersonnelFormProps) {
  // Compute pre-filled states if we are editing an existing profile

  const defaultValues =
    mode === "edit" && personnel
      ? {
          id: personnel.id,
          employeeId: personnel.employee_id,
          firstName: personnel.first_name,
          lastName: personnel.last_name,
          rankId: personnel.ranks?.id,
          designationId: personnel.designations?.id,
          office: personnel.office,
          contactNumber: personnel.contact_number,
          education:
            personnel.education.length > 0
              ? personnel.education
              : [{ degree: "", major: "", institution: "", onGoing: false }],
          socialMedia: {
            facebook: personnel.social_media?.facebook ?? "",
            twitter: personnel.social_media?.twitter ?? "",
            instagram: personnel.social_media?.instagram ?? "",
            linkedin: personnel.social_media?.linkedin ?? "",
          },
          profilePictureUrl: personnel.profile_picture_url ?? "",
        }
      : {
          employeeId: "",
          firstName: "",
          lastName: "",
          rankId: "",
          designationId: null,
          office: "",
          contactNumber: "",
          education: [
            {
              degree: "",
              major: "",
              institution: "",
              yearGraduated: "",
              onGoing: false,
            },
          ],
          socialMedia: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
          },
        };

  // The control is intentionally form-shape agnostic (`FieldValues`) so it can
  // flow into the shared, reusable field components; `handleFormSubmit` narrows
  // the values back to `PersonnelSubmitPayload` when handing them to the action.
  const { control, handleSubmit } = useForm<FieldValues>({
    resolver: zodResolver(
      mode === "edit" ? UpdatePersonnelSchema : PersonnelSchema,
    ) as unknown as Resolver<FieldValues>,
    defaultValues,
  });

  const educationValues = useWatch({ control, name: "education" });
  const formValues = useWatch({ control });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const { isPending, pendingBlobRef, submit } =
    useProfileSubmit<PersonnelSubmitPayload>({
      mode,
      onSuccess,
      submitAction,
      uploadAvatarAction,
      initialProfilePictureUrl: personnel?.profile_picture_url || undefined,
      failureMessage: "Failed to save personnel profile.",
      editSuccessMessage: "Personnel updated successfully.",
      createSuccessMessage: "Personnel profile created successfully!",
      buildPayload: (values, profilePictureUrl) => ({
        ...(values as PersonnelSubmitPayload),
        profilePictureUrl,
      }),
    });

  const handleFormSubmit: SubmitHandler<FieldValues> = (data) => {
    submit(data);
  };

  // Deferred so `handleSubmit` runs at event time, not during render — the
  // submit handler reads `pendingBlobRef`, and refs must not be read in render.
  const onSubmit = (event?: BaseSyntheticEvent) =>
    handleSubmit(handleFormSubmit, (errors) => {
      toast.error(
        getFirstErrorMessage(errors) ??
          "Please complete all required fields before submitting.",
      );
    })(event);

  return {
    control,
    isPending,
    fields,
    append,
    remove,
    educationValues,
    formValues,
    pendingBlobRef,
    onSubmit,
  };
}
