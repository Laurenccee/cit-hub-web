"use client";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import type { ContentType } from "../types";
import type { NewsFormData } from "../schema/news";
import { addNewsAction } from "../action";
import { useNewsForm } from "../hooks/useNewsForm";
import NewsForm from "./NewsForm";

const FORM_ID = "add-news-form";

const INITIAL_VALUES: NewsFormData = {
  title: "",
  description: "",
  content: "",
  slug: "",
  imageUrl: undefined,
  imageAlt: "",
  typesId: undefined,
  isPublished: false,
  isFeatured: false,
};

interface AddNewsDialogBodyProps {
  contentTypes: ContentType[];
  onSuccess: () => void;
}

export default function AddNewsDialogBody({
  contentTypes,
  onSuccess,
}: AddNewsDialogBodyProps) {
  const {
    control,
    isPending,
    pendingBlobRef,
    handleTitleChange,
    handleTypeChange,
    onSubmit,
  } = useNewsForm({
    mode: "create",
    initialValues: INITIAL_VALUES,
    contentTypes,
    submitAction: addNewsAction,
    onSuccess,
  });

  return (
    <>
      <NewsForm
        id={FORM_ID}
        contentTypes={contentTypes}
        control={control}
        isPending={isPending}
        pendingBlobRef={pendingBlobRef}
        handleTitleChange={handleTitleChange}
        handleTypeChange={handleTypeChange}
        onSubmit={onSubmit}
      />
      <DialogFooter className="px-6 py-4 border-t shrink-0">
        <Button type="submit" form={FORM_ID} size="lg" disabled={isPending}>
          {isPending ? "Publishing..." : "Publish"}
          {isPending ? (
            <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
          ) : (
            <HugeiconsIcon icon={PlusSignIcon} />
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
