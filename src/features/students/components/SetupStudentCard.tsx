"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Camera, Fingerprint, GraduationCap } from "lucide-react";
import {
  SetupStepper,
  ProfilePictureStep,
  IdentityStep,
  AcademicStep,
} from "./setup-steps";
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
] as const;

type StepId = (typeof STEPS)[number]["id"];

interface SetupStudentCardProps {
  courses: Course[];
  majors: Major[];
}

export default function SetupStudentCard({
  courses,
  majors,
}: SetupStudentCardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());

  const { control, isPending, formValues, pendingBlobRef, onSubmit } =
    useStudentForm({
      mode: "setup",
      submitAction: studentSetupAction,
      uploadAvatarAction,
    });

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const EyebrowIcon = currentStep.eyebrowIcon;

  const canGoNext = useCallback(() => {
    switch (currentStep.id) {
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
      case "profile":
        return true;
      default:
        return true;
    }
  }, [currentStep.id, formValues]);

  const handleNext = useCallback(() => {
    if (!canGoNext()) return;
    setCompletedSteps((prev) => new Set(prev).add(currentStep.id));
    setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [currentStep.id, canGoNext]);

  const handleBack = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

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
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Setup Student Profile
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Complete your student profile in 3 quick steps. You can review and
              edit details anytime.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated:{" "}
            <span className="font-semibold text-foreground">~1 minute</span>
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
            id="student-setup-form"
            onSubmit={onSubmit}
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
                  form="student-setup-form"
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
