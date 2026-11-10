"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import type { CreateEventDialogProps } from "../types";

const CreateEventDialogBody = dynamic(() => import("./CreateEventDialogBody"), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});

export default function CreateEventDialog({
  children,
  categories,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-180 max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Create New Event
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Fill in the details below. Required fields are marked with *
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {open && (
          <CreateEventDialogBody
            categories={categories}
            onClose={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
