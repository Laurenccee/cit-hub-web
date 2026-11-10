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
import type {
  Personnel,
  PersonnelSubmitPayload,
  UsePersonnelFormProps,
} from "../types";
import { useProfileSubmit } from "@/hooks/useProfileSubmit";

function getOwnMessage(error: object): string | null {
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message ? message : null;
}

function getFirstErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const own = getOwnMessage(error);
  if (own) return own;
  for (const value of Object.values(error as Record<string, unknown>)) {
    const nested = getFirstErrorMessage(value);
    if (nested) return nested;
  }
  return null;
}

function buildSocialMediaDefaults(socialMedia: Personnel["social_media"]) {
  return {
    facebook: socialMedia?.facebook ?? "",
    twitter: socialMedia?.twitter ?? "",
    instagram: socialMedia?.instagram ?? "",
    linkedin: socialMedia?.linkedin ?? "",
  };
}

function buildEditDefaults(personnel: Personnel) {
  return {
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
    socialMedia: buildSocialMediaDefaults(personnel.social_media),
    profilePictureUrl: personnel.profile_picture_url ?? "",
  };
}

function buildCreateDefaults() {
  return {
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
    socialMedia: buildSocialMediaDefaults({}),
  };
}

function buildDefaultValues(mode: UsePersonnelFormProps["mode"], personnel?: Personnel) {
  return mode === "edit" && personnel
    ? buildEditDefaults(personnel)
    : buildCreateDefaults();
}

export function usePersonnelForm({
  personnel,
  mode,
  onSuccess,
  submitAction,
  uploadAvatarAction,
}: UsePersonnelFormProps) {
  const defaultValues = buildDefaultValues(mode, personnel);

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
