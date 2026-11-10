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
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon } from "@hugeicons/core-free-icons";
import type { Course, Major, Student } from "../types";

const EditStudentDialogBody = dynamic(() => import("./EditStudentDialogBody"), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-md bg-muted/50" />,
});

interface EditStudentDialogProps {
  student: Student;
  courses: Course[];
  majors: Major[];
}

export default function EditStudentDialog({
  student,
  courses,
  majors,
}: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon-lg"
          variant="ghost"
          className="cursor-pointer transition-colors"
          aria-label={`Edit ${student.first_name} ${student.last_name}`}
        >
          <HugeiconsIcon icon={Edit01Icon} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update {student.first_name} {student.last_name}&apos;s profile and
            RFID card.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <EditStudentDialogBody
            student={student}
            courses={courses}
            majors={majors}
            onClose={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
