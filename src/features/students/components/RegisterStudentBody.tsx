"use client";

import { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MailIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import InputField from "@/components/shared/forms/InputField";
import { RegisterStudentData, RegisterStudentSchema } from "../schema/student";
import { registerStudentAction } from "../action";

const FORM_ID = "register-student";

interface RegisterStudentBodyProps {
  onClose: () => void;
}

export default function RegisterStudentBody({
  onClose,
}: RegisterStudentBodyProps) {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<RegisterStudentData>({
    resolver: zodResolver(RegisterStudentSchema),
    defaultValues: {
      email: "",
    },
  });

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

        onClose();
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
    <>
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
    </>
  );
}
