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
  ProfilePictureStep,
  IdentityStep,
  WorkAssignmentsStep,
  EducationStep,
  SocialStep,
} from "./setup-steps";
import { usePersonnelForm } from "../hooks/usePersonnelForm";
import { personnelSetupAction } from "../action";
import { uploadAvatarAction } from "@/actions/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TABS = [
  {
    id: "profile",
    label: "Photo",
    icon: Camera,
    eyebrow: "Corporate Badge & Directory Photo",
    title: "Profile Picture",
    description:
      "Upload a clear portrait photo for your personnel card, internal corporate directory, and team collaboration spaces.",
  },
  {
    id: "identity",
    label: "Identity",
    icon: Fingerprint,
    eyebrow: "Official Identity Record",
    title: "Identity Details",
    description:
      "Enter your official identification details as they appear on your employee records.",
  },
  {
    id: "work",
    label: "Work",
    icon: Briefcase,
    eyebrow: "Rank & Department Placement",
    title: "Work Assignment",
    description:
      "Select your rank, designation, and provide your office and contact details.",
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    eyebrow: "Academic Credentials",
    title: "Education Background",
    description:
      "Add your educational qualifications, including ongoing degrees and completed degrees with graduation years.",
  },
  {
    id: "social",
    label: "Social",
    icon: Link,
    eyebrow: "Professional Presence",
    title: "Social Channels",
    description:
      "Add your professional social media profiles. Optional, but helps students and colleagues connect with you.",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProfileEditCard({
  ranks,
  designations,
  initialPreview,
}: SetupPersonnelCardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(
    initialPreview?.profile_picture_url || "",
  );

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
    personnel: initialPreview ?? undefined,
    mode: "edit",
    submitAction: personnelSetupAction,
    uploadAvatarAction,
    onPendingChange: () => {},
    onSuccess: () => {},
  });

  const handleSubmit = useCallback(async () => {
    await onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Edit Personnel Profile
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Update your professional dossier. Changes are saved immediately.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void} className="w-full">
<TabsList className="grid w-full grid-cols-5">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => {
        const EyebrowIcon = tab.icon;
        return (
          <TabsContent key={tab.id} value={tab.id} className="focus-visible:ring-0 focus-visible:border-none mt-6">
            <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <EyebrowIcon className="size-3.5" />
                {tab.eyebrow}
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {tab.title}
              </h2>
              <p className="text-muted-foreground">{tab.description}</p>
            </div>

            <form
              id="personnel-edit-form"
              onSubmit={handleSubmit}
              className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8"
            >
              <div className="flex-1">
                {(() => {
                  switch (tab.id) {
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
                })()}
              </div>

              <div className="flex items-center justify-end gap-4 border-t pt-6">
                <Button
                  type="submit"
                  form="personnel-edit-form"
                  disabled={isPending}
                  size="lg"
                  className="gap-1.5 rounded-full"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                  <HugeiconsIcon icon={ArrowRightIcon} className="size-4" />
                </Button>
              </div>
            </form>
          </TabsContent>
        );
      })}
          </Tabs>
        </div>
      </div>
    </div>
  );
}