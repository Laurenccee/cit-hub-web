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

interface PioneerActionResult {
  success: boolean;
  message?: string;
}

interface PioneerActionConfig {
  run: () => Promise<PioneerActionResult>;
  failureMessage: string;
  successMessage: string;
}

async function runPioneerAction({
  run,
  failureMessage,
  successMessage,
}: PioneerActionConfig): Promise<boolean> {
  try {
    const result = await run();
    if (!result.success) throw new Error(result.message || failureMessage);
    toast.success(result.message ?? successMessage);
    return true;
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "An unexpected error occurred.",
    );
    return false;
  }
}

function pioneerTrigger(isPioneer: boolean) {
  if (isPioneer) {
    return (
      <Badge variant="default" size="lg" className="cursor-pointer gap-1">
        <HugeiconsIcon icon={Award01Icon} className="size-3.5" />
        Pioneer
      </Badge>
    );
  }
  return (
    <Button
      size="icon-lg"
      variant="ghost"
      className="cursor-pointer text-muted-foreground hover:text-foreground"
      aria-label="Register as Pioneer"
    >
      <HugeiconsIcon icon={Award01Icon} />
    </Button>
  );
}

function PioneerSubmitLabel({
  isPending,
  isPioneer,
}: {
  isPending: boolean;
  isPioneer: boolean;
}) {
  if (isPending) return <Loader2 size={16} className="animate-spin" />;
  return <>{isPioneer ? "Revoke Pioneer" : "Register as Pioneer"}</>;
}

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

  const execute = async (config: PioneerActionConfig) => {
    setIsPending(true);
    try {
      if (await runPioneerAction(config)) setOpen(false);
    } finally {
      setIsPending(false);
    }
  };

  const handlePromote = () =>
    execute({
      run: () => promoteToPioneerAction({ id: student.id }),
      failureMessage: "Failed to register as Pioneer.",
      successMessage: "Student registered as Pioneer.",
    });

  const handleRevoke = () =>
    execute({
      run: () => revokePioneerAction(student.id),
      failureMessage: "Failed to revoke Pioneer status.",
      successMessage: "Pioneer status revoked.",
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{pioneerTrigger(isPioneer)}</DialogTrigger>
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
            <PioneerSubmitLabel isPending={isPending} isPioneer={isPioneer} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
