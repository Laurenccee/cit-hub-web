"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState } from "react";
import { ContentType } from "../types";
import NewsForm from "./NewsForm";
import { NewsFormData } from "../schema/news";
import { addNewsAction } from "../action";
import { useNewsForm } from "../hooks/useNewsForm";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

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

export default function AddNewsButton({
  contentTypes,
}: {
  contentTypes: ContentType[];
}) {
  const { isAdmin, isFaculty } = useAuth();
  const [open, setOpen] = useState(false);

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
    onSuccess: () => setOpen(false),
  });

  if (!isAdmin && !isFaculty) return null;

  return (
    (isAdmin || isFaculty) && (
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button size="icon-lg" className="w-full aspect-square sm:w-auto">
                <HugeiconsIcon icon={PlusSignIcon} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Add News & Announcement</TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-2xl flex p-0 flex-row max-h-[80vh]">
          <div className="flex flex-col flex-1 min-w-0 max-h-[80vh]">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>Add News & Announcement</DialogTitle>
              <DialogDescription>
                Fill in the details below to publish a new article or
                announcement.
              </DialogDescription>
            </DialogHeader>
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
              <Button
                type="submit"
                form={FORM_ID}
                size="lg"
                disabled={isPending}
              >
                {isPending ? "Publishing..." : "Publish"}
                {isPending ? (
                  <HugeiconsIcon
                    icon={Loading02Icon}
                    className="animate-spin"
                  />
                ) : (
                  <HugeiconsIcon icon={PlusSignIcon} />
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    )
  );
}
