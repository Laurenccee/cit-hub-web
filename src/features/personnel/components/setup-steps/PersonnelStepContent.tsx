"use client";

import { ProfilePictureStep } from "@/components/shared/ProfilePictureStep";
import { Designation, Rank } from "../../types";
import type { Control, FieldValues } from "react-hook-form";
import {
  IdentityStep,
  WorkAssignmentsStep,
  EducationStep,
  SocialStep,
} from "./index";

interface PersonnelStepContentProps {
  stepId: string;
  control: Control<FieldValues>;
  isPending: boolean;
  ranks: Rank[];
  designations: Designation[];
  profilePreviewUrl: string;
  onProfilePreviewChange: (url: string) => void;
  pendingBlobRef: React.MutableRefObject<Blob | null>;
}

/**
 * Renders the fields for a single personnel step. Shared by the setup wizard
 * and the tabbed profile editor so both surfaces stay in lockstep.
 */
export function PersonnelStepContent({
  stepId,
  control,
  isPending,
  ranks,
  designations,
  profilePreviewUrl,
  onProfilePreviewChange,
  pendingBlobRef,
}: PersonnelStepContentProps) {
  switch (stepId) {
    case "profile":
      return (
        <ProfilePictureStep
          control={control}
          isPending={isPending}
          profilePreviewUrl={profilePreviewUrl}
          onProfilePreviewChange={onProfilePreviewChange}
          pendingBlobRef={pendingBlobRef}
        />
      );
    case "identity":
      return <IdentityStep control={control} isPending={isPending} />;
    case "work":
      return (
        <WorkAssignmentsStep
          control={control}
          isPending={isPending}
          ranks={ranks}
          designations={designations}
        />
      );
    case "education":
      return <EducationStep control={control} isPending={isPending} />;
    case "social":
      return <SocialStep control={control} isPending={isPending} />;
    default:
      return null;
  }
}
