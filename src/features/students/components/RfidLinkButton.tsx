"use client";

import { useState } from "react";
import { Nfc, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { linkStudentRfidAction } from "../action";

interface RfidLinkButtonProps {
  studentId: string;
  studentName: string;
}

export default function RfidLinkButton({
  studentId,
  studentName,
}: RfidLinkButtonProps) {
  const [open, setOpen] = useState(false);
  const [uid, setUid] = useState("");
  const [isPending, setIsPending] = useState(false);

  const submitUid = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isPending) return;
    setIsPending(true);
    try {
      const result = await linkStudentRfidAction(studentId, trimmed);
      if (!result.success) throw new Error(result.message);
      toast.success(result.message);
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to link RFID card.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setUid("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`RFID credential for ${studentName}`}
          className="h-8 w-8 text-slate-400 hover:text-slate-700"
        >
          <Nfc className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan RFID Card</DialogTitle>
          <DialogDescription>
            Tap {studentName}&apos;s card on the reader, or type the UID
            manually.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={uid}
          disabled={isPending}
          placeholder="Waiting for card scan..."
          onChange={(e) => setUid(e.target.value)}
          onKeyDown={(e) => {
            // USB HID readers emit the card UID as keystrokes terminated by Enter.
            if (e.key === "Enter") {
              e.preventDefault();
              submitUid(uid);
            }
          }}
        />
        <DialogFooter>
          <Button
            type="button"
            onClick={() => submitUid(uid)}
            disabled={isPending || !uid.trim()}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Link Card"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
