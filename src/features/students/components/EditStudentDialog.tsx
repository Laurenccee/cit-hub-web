"use client";

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
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon } from "@hugeicons/core-free-icons";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import InputField from "@/components/shared/InputField";
import ComboboxField from "@/components/shared/ComboboxField";
import ImageDropzone from "@/components/shared/ImageDropzone";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useStudentForm } from "../hooks/useStudentForm";
import { updateStudentAction, deleteStudentAction } from "../action";
import { uploadAvatarAction } from "@/actions/image";
import { toast } from "sonner";
import { Course, Major, Student } from "../types";
import { SECTIONS, YEAR_LEVELS } from "../schema/student";

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const { control, isPending, pendingBlobRef, onSubmit } = useStudentForm({
    student,
    mode: "edit",
    submitAction: updateStudentAction,
    uploadAvatarAction,
    onSuccess: () => setOpen(false),
  });

  const handleDelete = async () => {
    setIsDeletePending(true);
    try {
      const result = await deleteStudentAction(student.id);
      if (!result.success) throw new Error(result.message);
      toast.success(result.message);
      setDeleteOpen(false);
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete student.",
      );
    } finally {
      setIsDeletePending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon-xs"
          variant="outline"
          className="cursor-pointer hover:bg-accent transition-colors"
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
        <form
          id="edit-student-form"
          onSubmit={onSubmit}
          className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 py-2"
        >
          <div className="mx-auto h-24 w-24">
            <ImageDropzone
              variant="avatar"
              inputId="edit-student-photo"
              initialUrl={student.profile_picture_url ?? undefined}
              onFile={(blob) => {
                pendingBlobRef.current = blob;
              }}
            />
          </div>
          <InputField
            name="studentId"
            label="Student ID"
            control={control}
            isPending={isPending}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              name="firstName"
              label="First Name"
              control={control}
              isPending={isPending}
            />
            <InputField
              name="lastName"
              label="Last Name"
              control={control}
              isPending={isPending}
            />
          </div>
          <ComboboxField
            name="courseId"
            label="Course"
            placeholder="Select course"
            searchPlaceholder="Search courses..."
            options={courses}
            valueKey="id"
            labelKey="name"
            control={control}
            isPending={isPending}
          />
          <ComboboxField
            name="majorId"
            label="Major"
            placeholder="Select major"
            searchPlaceholder="Search majors..."
            options={majors}
            valueKey="id"
            labelKey="name"
            control={control}
            isPending={isPending}
          />
          <div className="grid grid-cols-2 gap-3">
            <ComboboxField
              name="yearLevel"
              label="Year Level"
              placeholder="Select year level"
              options={[...YEAR_LEVELS]}
              valueKey="value"
              labelKey="label"
              control={control}
              isPending={isPending}
            />
            <ComboboxField
              name="section"
              label="Section"
              placeholder="Select section"
              options={[...SECTIONS]}
              valueKey="value"
              labelKey="label"
              control={control}
              isPending={isPending}
            />
          </div>
          <InputField
            name="contactNumber"
            label="Contact Number"
            control={control}
            isPending={isPending}
          />
          <InputField
            name="rfidUid"
            label="RFID Card UID"
            control={control}
            isPending={isPending}
            placeholder="Scan or enter card UID"
          />
        </form>
        <DialogFooter className="flex gap-2 border-t pt-4">
          <DeleteConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete student"
            description={`This will permanently remove ${student.first_name} ${student.last_name}'s account and profile.`}
            isPending={isDeletePending}
            onConfirm={handleDelete}
          />
          <Button
            type="submit"
            form="edit-student-form"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
