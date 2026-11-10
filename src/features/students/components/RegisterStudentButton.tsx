"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/hooks/useAuth";

const RegisterStudentBody = dynamic(() => import("./RegisterStudentBody"), {
  ssr: false,
  loading: () => <div className="h-24 animate-pulse rounded-md bg-muted/50" />,
});

export default function RegisterStudentButton() {
  const { isAdmin, isPioneer } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAdmin && !isPioneer) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 gap-1.5 bg-primary px-4 text-xs font-semibold hover:bg-primary/90">
          <UserPlus className="h-4 w-4" />
          Add New Student
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-md flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base text-primary">
            Add New Student
          </DialogTitle>
          <DialogDescription className="text-sm">
            Fill in the student&apos;s email below. They will receive
            instructions to set up their own profile.
          </DialogDescription>
        </DialogHeader>
        {open && <RegisterStudentBody onClose={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
