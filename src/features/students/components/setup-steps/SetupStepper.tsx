"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  sublabel: string;
  isComplete?: boolean;
  isActive?: boolean;
}

interface SetupStepperProps {
  steps: Step[];
  currentStepIndex: number;
}

export function SetupStepper({ steps }: SetupStepperProps) {
  return (
    <ol className="flex w-full items-start gap-4">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.id}
            className="relative flex flex-1 flex-col items-center gap-4 text-center"
          >
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-5 right-[calc(-50%+2.5rem)] left-[calc(50%+2.5rem)] h-px",
                  step.isComplete ? "bg-primary/40" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                step.isActive &&
                  "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
                step.isComplete &&
                  !step.isActive &&
                  "border-primary bg-primary text-primary-foreground",
                !step.isActive &&
                  !step.isComplete &&
                  "border-border bg-muted text-muted-foreground",
              )}
            >
              {step.isComplete && !step.isActive ? (
                <Check className="size-4" strokeWidth={3} />
              ) : (
                index + 1
              )}
            </span>
            <span className="flex flex-col gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  step.isActive ? "text-primary" : "text-foreground",
                )}
              >
                {step.label}
              </span>
              {step.isActive ? (
                <span className="text-[11px] font-semibold tracking-widest text-primary/70 uppercase">
                  Active
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {step.sublabel}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
