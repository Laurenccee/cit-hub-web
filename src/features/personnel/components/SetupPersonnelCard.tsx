"use client";

import { useCallback, useState } from "react";
import { SetupWizard } from "@/components/shared/wizard/SetupWizard";
import { SetupPersonnelCardProps } from "../types";
import { PersonnelStepContent } from "./setup-steps/PersonnelStepContent";
import { PERSONNEL_WIZARD_STEPS } from "./setup-steps/steps";
import { usePersonnelForm } from "../hooks/usePersonnelForm";
import { personnelSetupAction } from "../action";
import { uploadAvatarAction } from "@/actions/image";

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
      steps={PERSONNEL_WIZARD_STEPS}
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
