"use client";

import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { SetupStepper } from "@/components/shared/SetupStepper";

export interface WizardStep {
  id: string;
  label: string;
  sublabel: string;
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: string;
  description: string;
}

interface SetupWizardProps {
  steps: readonly WizardStep[];
  /** Page heading shown above the stepper. */
  title: string;
  /** Supporting copy under the heading. */
  description: string;
  /** Human-readable duration, e.g. "~2 minutes". */
  estimate: string;
  /** DOM id shared by the form and its submit button. */
  formId: string;
  /** Whether a submit is in flight; disables navigation and the submit button. */
  isPending: boolean;
  /** Whether the user may advance from the given step. */
  canGoNext: (stepId: string) => boolean;
  /** Called on final submit; the form is already prevented and validated. */
  onSubmit: () => void | Promise<void>;
  /** Renders the current step's fields. */
  renderStep: (stepId: string) => ReactNode;
}

/**
 * Shared multi-step setup shell: heading, stepper, and back/continue controls.
 * Personnel and student onboarding run the same flow with different steps, so
 * the layout and navigation live here while each caller supplies its own fields.
 */
export function SetupWizard({
  steps,
  title,
  description,
  estimate,
  formId,
  isPending,
  canGoNext,
  onSubmit,
  renderStep,
}: SetupWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const EyebrowIcon = currentStep.eyebrowIcon;
  const canAdvance = canGoNext(currentStep.id);

  const handleNext = useCallback(() => {
    if (!canGoNext(currentStep.id)) return;
    setCompletedSteps((prev) => new Set(prev).add(currentStep.id));
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, [currentStep.id, canGoNext, steps.length]);

  const handleBack = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void onSubmit();
    },
    [onSubmit],
  );

  const stepsWithStatus = steps.map((step, index) => ({
    id: step.id,
    label: step.label,
    sublabel: step.sublabel,
    isComplete: completedSteps.has(step.id),
    isActive: index === currentStepIndex,
  }));

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{description}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated:{" "}
            <span className="font-semibold text-foreground">{estimate}</span>
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
            id={formId}
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8"
          >
            <div className="flex-1">{renderStep(currentStep.id)}</div>

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
                  form={formId}
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
                  disabled={isPending || !canAdvance}
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
