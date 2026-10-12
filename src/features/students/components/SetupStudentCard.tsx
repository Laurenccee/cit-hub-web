"use client";

import { useCallback, useState } from "react";
import { Camera, Fingerprint, GraduationCap } from "lucide-react";
import { SetupWizard, type WizardStep } from "@/components/shared/SetupWizard";
import { ProfilePictureStep } from "@/components/shared/ProfilePictureStep";
import { IdentityStep, AcademicStep } from "./setup-steps";
import { useStudentForm } from "../hooks/useStudentForm";
import { studentSetupAction } from "../action";
import { uploadAvatarAction } from "@/actions/image";
import { Course, Major } from "../types";

const STEPS = [
  {
    id: "profile",
    label: "Photo",
    sublabel: "Portrait",
    eyebrow: "Student ID & Directory Photo",
    eyebrowIcon: Camera,
    title: "Profile Picture",
    description:
      "Upload a clear portrait photo for your student card and the campus directory.",
  },
  {
    id: "identity",
    label: "Identity",
    sublabel: "Details",
    eyebrow: "Official Student Record",
    eyebrowIcon: Fingerprint,
    title: "Identity Details",
    description:
      "Enter your official student number and name as they appear on your school records.",
  },
  {
    id: "academic",
    label: "Academic",
    sublabel: "Program",
    eyebrow: "Program & Contact Details",
    eyebrowIcon: GraduationCap,
    title: "Academic Information",
    description:
      "Tell us your program, year level, section, and how to reach you.",
  },
] as const satisfies readonly WizardStep[];

interface SetupStudentCardProps {
  courses: Course[];
  majors: Major[];
}

export default function SetupStudentCard({
  courses,
  majors,
}: SetupStudentCardProps) {
  const [profilePreviewUrl, setProfilePreviewUrl] = useState("");

  const { control, isPending, formValues, pendingBlobRef, onSubmit } =
    useStudentForm({
      mode: "setup",
      submitAction: studentSetupAction,
      uploadAvatarAction,
    });

  const canGoNext = useCallback(
    (stepId: string) => {
      switch (stepId) {
        case "identity":
          return !!(
            formValues?.studentId &&
            formValues?.firstName &&
            formValues?.lastName
          );
        case "academic":
          return !!(
            formValues?.courseId &&
            formValues?.yearLevel &&
            formValues?.section
          );
        default:
          return true;
      }
    },
    [formValues],
  );

  const renderStep = (stepId: string) => {
    switch (stepId) {
      case "profile":
        return (
          <ProfilePictureStep
            control={control}
            isPending={isPending}
            profilePreviewUrl={profilePreviewUrl}
            onProfilePreviewChange={setProfilePreviewUrl}
            pendingBlobRef={pendingBlobRef}
            allowWebcam={false}
          />
        );
      case "identity":
        return <IdentityStep control={control} isPending={isPending} />;
      case "academic":
        return (
          <AcademicStep
            control={control}
            isPending={isPending}
            courses={courses}
            majors={majors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SetupWizard
      steps={STEPS}
      title="Setup Student Profile"
      description="Complete your student profile in 3 quick steps. You can review and edit details anytime."
      estimate="~1 minute"
      formId="student-setup-form"
      isPending={isPending}
      canGoNext={canGoNext}
      onSubmit={onSubmit}
      renderStep={renderStep}
    />
  );
}
