"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { ContentType } from "../types";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

const AddNewsDialogBody = dynamic(() => import("./AddNewsDialogBody"), {
  ssr: false,
  loading: () => <Skeleton className="mx-6 my-4 h-64" />,
});

export default function AddNewsButton({
  contentTypes,
}: {
  contentTypes: ContentType[];
}) {
  const { isAdmin, isFaculty } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAdmin && !isFaculty) return null;

  return (
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
      <DialogContent className="sm:max-w-2xl         flex p-0 flex-row max-h-dialog">
        <div className="flex flex-col flex-1 min-w-0 max-h-dialog">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Add News & Announcement</DialogTitle>
            <DialogDescription>
              Fill in the details below to publish a new article or
              announcement.
            </DialogDescription>
          </DialogHeader>
          {open && (
            <AddNewsDialogBody
              contentTypes={contentTypes}
              onSuccess={() => setOpen(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

