"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Camera,
  Fingerprint,
  GraduationCap,
  Link,
} from "lucide-react";
import { SetupPersonnelCardProps } from "../types";
import {
  SetupStepper,
  ProfilePictureStep,
  IdentityStep,
  WorkAssignmentsStep,
  EducationStep,
  SocialStep,
} from "./setup-steps";
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
] as const;

type StepId = (typeof STEPS)[number]["id"];

export default function SetupPersonnelCard({
  ranks,
  designations,
  initialPreview,
}: SetupPersonnelCardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(
    initialPreview?.profile_picture_url || "",
  );
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());

  const {
    control,
    isPending,
    fields,
    append,
    remove,
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

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const EyebrowIcon = currentStep.eyebrowIcon;

  const canGoNext = useCallback(() => {
    switch (currentStep.id) {
      case "identity": {
        return !!(
          formValues.firstName &&
          formValues.lastName &&
          formValues.employeeId
        );
      }
      case "work": {
        return !!(formValues.rankId && formValues.office);
      }
      case "education": {
        return (
          educationValues.length > 0 &&
          educationValues.every(
            (e: { degree?: string; institution?: string }) =>
              e.degree && e.institution,
          )
        );
      }
      case "social":
      case "profile":
        return true;
      default:
        return true;
    }
  }, [currentStep.id, formValues, educationValues]);

  const handleNext = useCallback(() => {
    if (!canGoNext()) return;
    setCompletedSteps((prev) => new Set(prev).add(currentStep.id));
    setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [currentStep.id, canGoNext]);

  const handleBack = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    await onSubmit();
  }, [onSubmit]);

  const stepsWithStatus = STEPS.map((step, index) => ({
    id: step.id,
    label: step.label,
    sublabel: step.sublabel,
    isComplete: completedSteps.has(step.id),
    isActive: index === currentStepIndex,
  }));

  const renderStep = () => {
    switch (currentStep.id) {
      case "profile":
        return (
          <ProfilePictureStep
            control={control}
            isPending={isPending}
            profilePreviewUrl={profilePreviewUrl}
            onProfilePreviewChange={setProfilePreviewUrl}
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
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Setup Personnel Profile
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Complete your professional dossier in 5 quick steps. You can
              review and edit details anytime.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated:{" "}
            <span className="font-semibold text-foreground">~2 minutes</span>
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <SetupStepper
            steps={stepsWithStatus}
            currentStepIndex={currentStepIndex}
          />
        </div>

        <div className="flex flex-col gap-8 rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <EyebrowIcon className="size-3.5" />
              {currentStep.eyebrow}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {currentStep.title}
            </h2>
            <p className="text-muted-foreground">{currentStep.description}</p>
          </div>

          <form
            id="personnel-setup-form"
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8"
          >
            <div className="flex-1">{renderStep()}</div>

            <div className="flex items-center justify-between gap-4 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBack}
                disabled={isFirstStep || isPending}
                className="gap-1.5 rounded-full"
              >
                <HugeiconsIcon icon={ArrowLeftIcon} className="size-4" />
                Back
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  form="personnel-setup-form"
                  disabled={isPending}
                  size="lg"
                  className="gap-1.5 rounded-full"
                >
                  {isPending ? "Saving..." : "Complete Setup"}
                  <HugeiconsIcon
                    icon={ArrowRightIcon}
                    className={cn(isPending && "animate-spin", "size-4")}
                  />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isPending || !canGoNext()}
                  size="lg"
                  className="gap-1.5 rounded-full"
                >
                  Continue
                  <HugeiconsIcon icon={ArrowRightIcon} className="size-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
