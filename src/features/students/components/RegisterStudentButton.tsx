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
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Loader2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MailIcon } from "@hugeicons/core-free-icons";
import InputField from "@/components/shared/InputField";

import { SubmitHandler, useForm } from "react-hook-form";
import { RegisterStudentData, RegisterStudentSchema } from "../schema/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerStudentAction } from "../action";
import { toast } from "sonner";

const FORM_ID = "register-student";

export default function RegisterStudentButton() {
  const { isAdmin, isPioneer } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<RegisterStudentData>({
    resolver: zodResolver(RegisterStudentSchema),
    defaultValues: {
      email: "",
    },
  });

  if (!isAdmin && !isPioneer) return null;

  const handleFormSubmit: SubmitHandler<RegisterStudentData> = async (data) => {
    startTransition(async () => {
      try {
        const result = await registerStudentAction(data);

        if (!result.success) {
          throw new Error(result.message || "Failed to add student.");
        }

        toast.success(
          "Student account created successfully! An email has been sent with instructions to set up their profile.",
        );

        reset();
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        );
      }
    });
  };

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

        <form
          id={FORM_ID}
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <InputField
            name="email"
            label="Student Email"
            control={control}
            isPending={isPending}
            placeholder="e.g. juan.delacruz@student.cit.edu"
            leadingIcon={<HugeiconsIcon icon={MailIcon} />}
          />
        </form>
        <DialogFooter className="border-t pt-4">
          <Button type="submit" form={FORM_ID} size="xl" disabled={isPending}>
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Add Student"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
