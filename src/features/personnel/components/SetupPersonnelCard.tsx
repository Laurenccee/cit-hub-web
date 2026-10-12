"use client";

import { useCallback, useState } from "react";
import {
  Briefcase,
  Camera,
  Fingerprint,
  GraduationCap,
  Link,
} from "lucide-react";
import { SetupWizard, type WizardStep } from "@/components/shared/SetupWizard";
import { SetupPersonnelCardProps } from "../types";
import { PersonnelStepContent } from "./setup-steps/PersonnelStepContent";
import { usePersonnelForm } from "../hooks/usePersonnelForm";
import { personnelSetupAction } from "../action";
import { uploadAvatarAction } from "@/actions/image";

const STEPS = [
  {
    id: "profile",
    label: "Photo",
    sublabel: "Portrait",
    eyebrow: "Corporate Badge & Directory Photo",
    eyebrowIcon: Camera,
    title: "Profile Picture",
    description:
      "Upload a clear portrait photo for your personnel card, internal corporate directory, and team collaboration spaces.",
  },
  {
    id: "identity",
    label: "Identity",
    sublabel: "Details",
    eyebrow: "Official Identity Record",
    eyebrowIcon: Fingerprint,
    title: "Identity Details",
    description:
      "Enter your official identification details as they appear on your employee records.",
  },
  {
    id: "work",
    label: "Work",
    sublabel: "Department",
    eyebrow: "Rank & Department Placement",
    eyebrowIcon: Briefcase,
    title: "Work Assignment",
    description:
      "Select your rank, designation, and provide your office and contact details.",
  },
  {
    id: "education",
    label: "Education",
    sublabel: "Degrees",
    eyebrow: "Academic Credentials",
    eyebrowIcon: GraduationCap,
    title: "Education Background",
    description:
      "Add your educational qualifications, including ongoing degrees and completed degrees with graduation years.",
  },
  {
    id: "social",
    label: "Social",
    sublabel: "Links",
    eyebrow: "Professional Presence",
    eyebrowIcon: Link,
    title: "Social Channels",
    description:
      "Add your professional social media profiles. Optional, but helps students and colleagues connect with you.",
  },
] as const satisfies readonly WizardStep[];

export default function SetupPersonnelCard({
  ranks,
  designations,
  initialPreview,
}: SetupPersonnelCardProps) {
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(
    initialPreview?.profile_picture_url || "",
  );

  const {
    control,
    isPending,
    educationValues,
    formValues,
    pendingBlobRef,
    onSubmit,
  } = usePersonnelForm({
    personnel: undefined,
    mode: "setup",
    submitAction: personnelSetupAction,
    uploadAvatarAction,
    onPendingChange: () => {},
    onSuccess: () => {},
  });

  const canGoNext = useCallback(
    (stepId: string) => {
      switch (stepId) {
        case "identity":
          return !!(
            formValues.firstName &&
            formValues.lastName &&
            formValues.employeeId
          );
        case "work":
          return !!(formValues.rankId && formValues.office);
        case "education":
          return (
            educationValues.length > 0 &&
            educationValues.every(
              (e: { degree?: string; institution?: string }) =>
                e.degree && e.institution,
            )
          );
        default:
          return true;
      }
    },
    [formValues, educationValues],
  );

  return (
    <SetupWizard
      steps={STEPS}
      title="Setup Personnel Profile"
      description="Complete your professional dossier in 5 quick steps. You can review and edit details anytime."
      estimate="~2 minutes"
      formId="personnel-setup-form"
      isPending={isPending}
      canGoNext={canGoNext}
      onSubmit={onSubmit}
      renderStep={(stepId) => (
        <PersonnelStepContent
          stepId={stepId}
          control={control}
          isPending={isPending}
          ranks={ranks}
          designations={designations}
          profilePreviewUrl={profilePreviewUrl}
          onProfilePreviewChange={setProfilePreviewUrl}
          pendingBlobRef={pendingBlobRef}
        />
      )}
    />
  );
}
