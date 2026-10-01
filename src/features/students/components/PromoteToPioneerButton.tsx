"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon } from "@hugeicons/core-free-icons";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLES } from "@/utils/constants/roles";
import { promoteToPioneerAction, revokePioneerAction } from "../action";
import { Student } from "../types";

export default function PromoteToPioneerButton({
  student,
}: {
  student: Student;
}) {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isPioneer = student.profiles?.role_id === ROLES.PIONEER;

  if (!isAdmin) return null;

  const handlePromote = async () => {
    setIsPending(true);
    try {
      const result = await promoteToPioneerAction({ id: student.id });
      if (!result.success) {
        throw new Error(result.message || "Failed to register as Pioneer.");
      }
      toast.success(result.message ?? "Student registered as Pioneer.");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleRevoke = async () => {
    setIsPending(true);
    try {
      const result = await revokePioneerAction(student.id);
      if (!result.success) {
        throw new Error(result.message || "Failed to revoke Pioneer status.");
      }
      toast.success(result.message ?? "Pioneer status revoked.");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isPioneer ? (
          <Badge variant="default" size="lg" className="cursor-pointer gap-1">
            <HugeiconsIcon icon={Award01Icon} className="size-3.5" />
            Pioneer
          </Badge>
        ) : (
          <Button
            size="icon-xs"
            variant="outline"
            className="cursor-pointer"
            aria-label="Register as Pioneer"
          >
            <HugeiconsIcon icon={Award01Icon} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isPioneer ? "Revoke Pioneer Status" : "Register as Pioneer"}
          </DialogTitle>
          <DialogDescription>
            {isPioneer
              ? `Remove ${student.first_name} ${student.last_name}'s Pioneer privileges and return them to a regular Student account.`
              : `Grant ${student.first_name} ${student.last_name} Pioneer-level access to manage the student directory.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant={isPioneer ? "destructive" : "default"}
            disabled={isPending}
            onClick={isPioneer ? handleRevoke : handlePromote}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPioneer ? (
              "Revoke Pioneer"
            ) : (
              "Register as Pioneer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
