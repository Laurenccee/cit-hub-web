"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { SetupPersonnelCardProps } from "../types";
import PersonnelEditTabs from "./PersonnelEditTabs";
import { type PersonnelStepId } from "./setup-steps/steps";
import { usePersonnelForm } from "../hooks/usePersonnelForm";
import { updatePersonnelAction } from "../action";
import { uploadAvatarAction } from "@/actions/image";

export default function ProfileEditCard({
  ranks,
  designations,
  initialPreview,
}: SetupPersonnelCardProps) {
  const [activeTab, setActiveTab] = useState<PersonnelStepId>("profile");
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(
    initialPreview?.profile_picture_url || "",
  );

  const {
    control,
    isPending,
    pendingBlobRef,
    onSubmit,
  } = usePersonnelForm({
    personnel: initialPreview ?? undefined,
    mode: "edit",
    submitAction: updatePersonnelAction,
    uploadAvatarAction,
  });

  return (
    <div className="flex flex-col">
      <div className="rounded-2xl border bg-card p-4 sm:p-6">
        <PersonnelEditTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          formId="personnel-edit-form"
          onSubmit={onSubmit}
          control={control}
          isPending={isPending}
          ranks={ranks}
          designations={designations}
          profilePreviewUrl={profilePreviewUrl}
          onProfilePreviewChange={setProfilePreviewUrl}
          pendingBlobRef={pendingBlobRef}
        >
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
        </PersonnelEditTabs>
      </div>
    </div>
  );
}
