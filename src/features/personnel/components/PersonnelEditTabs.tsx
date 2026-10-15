"use client";

import type { BaseSyntheticEvent, MutableRefObject, ReactNode } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Designation, Rank } from "../types";
import { PersonnelStepContent } from "./setup-steps/PersonnelStepContent";
import { PERSONNEL_STEPS, type PersonnelStepId } from "./setup-steps/steps";

interface PersonnelEditTabsProps {
  activeTab: PersonnelStepId;
  onTabChange: (value: PersonnelStepId) => void;
  formId: string;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  control: Control<FieldValues>;
  isPending: boolean;
  ranks: Rank[];
  designations: Designation[];
  profilePreviewUrl: string;
  onProfilePreviewChange: (url: string) => void;
  pendingBlobRef: MutableRefObject<Blob | null>;
  /** Rendered inside the form, after the step fields (e.g. a submit footer). */
  children?: ReactNode;
}

/**
 * The tabbed personnel editor: step tabs, the per-step header, and the form
 * that hosts the shared `PersonnelStepContent`. Used by both the profile edit
 * card and the edit dialog so their structure and copy never drift.
 */
export default function PersonnelEditTabs({
  activeTab,
  onTabChange,
  formId,
  onSubmit,
  control,
  isPending,
  ranks,
  designations,
  profilePreviewUrl,
  onProfilePreviewChange,
  pendingBlobRef,
  children,
}: PersonnelEditTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange as (value: string) => void}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-5">
        {PERSONNEL_STEPS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {PERSONNEL_STEPS.map((tab) => {
        const EyebrowIcon = tab.icon;
        return (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="mt-6 focus-visible:border-none focus-visible:ring-0"
          >
            <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <EyebrowIcon className="size-3.5" />
                {tab.eyebrow}
              </span>
              <h2 className="text-section text-foreground">{tab.title}</h2>
              <p className="text-muted-foreground">{tab.description}</p>
            </div>

            <form
              id={formId}
              onSubmit={onSubmit}
              className="mx-auto mt-6 flex w-full max-w-2xl flex-col gap-8"
            >
              <PersonnelStepContent
                stepId={tab.id}
                control={control}
                isPending={isPending}
                ranks={ranks}
                designations={designations}
                profilePreviewUrl={profilePreviewUrl}
                onProfilePreviewChange={onProfilePreviewChange}
                pendingBlobRef={pendingBlobRef}
              />
              {children}
            </form>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
