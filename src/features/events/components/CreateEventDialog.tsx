"use client";

import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Controller } from "react-hook-form";
import {
  Loader2,
  Calendar,
  MapPin,
  Image,
  AlertCircle,
} from "lucide-react";
import ComboboxField from "@/components/shared/ComboboxField";
import ImageDropzone from "@/components/shared/ImageDropzone";
import { EventCategory } from "../types";
import { ReactNode } from "react";
import { getEventCategoriesAction } from "../action";
import { useEventForm } from "../hooks/useEventForm";

interface CreateEventDialogProps {
  children: ReactNode;
  onSuccess?: () => void;
}

export function CreateEventDialog({
  children,
  onSuccess,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const imageBlobRef = useRef<Blob | null>(null);

  const {
    control,
    isPending,
    formState: { errors },
    titleValue,
    syncSlug,
    onSubmit,
    reset,
  } = useEventForm({
    onSuccess,
    onClose: () => {
      setOpen(false);
      imageBlobRef.current = null;
    },
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await getEventCategoriesAction();
        if (!cancelled && result.success) setCategories(result.categories);
      } catch {
        // Error surfaced on submit if categories are still empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Sync slug whenever title changes.
  useEffect(() => {
    syncSlug(titleValue ?? "");
  }, [titleValue, syncSlug]);

  const handleClose = () => {
    setOpen(false);
    reset();
    imageBlobRef.current = null;
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-180 max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8B1A1A]/10 text-[#8B1A1A]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Create New Event
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-0.5">
                Fill in the details below. Required fields are marked with *
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit(imageBlobRef)} className="space-y-6">
          {/* Section: Event Image */}
          <fieldset className="space-y-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wide">
              <span className="h-6 w-6 flex items-center justify-center rounded bg-slate-100 text-slate-600">
                1
              </span>
              Event Image
            </legend>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Image className="h-3.5 w-3.5 text-slate-400" />
                Cover Image
              </Label>
              <ImageDropzone
                variant="news"
                inputId="event-image"
                initialUrl={undefined}
                onFile={(blob) => { imageBlobRef.current = blob; }}
              />
              <p className="text-xs text-slate-500">
                Recommended 16:9 aspect ratio. Will be cropped to 16:9.
              </p>
            </div>

            <Controller
              name="imageAlt"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="imageAlt" className="text-sm font-medium">
                    Image Alt Text
                  </Label>
                  <Input
                    id="imageAlt"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Accessibility description of the image"
                  />
                </div>
              )}
            />
          </fieldset>

          <Separator className="my-2" />

          {/* Section: Basic Information */}
          <fieldset className="space-y-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wide">
              <span className="h-6 w-6 flex items-center justify-center rounded bg-slate-100 text-slate-600">
                2
              </span>
              Basic Information
            </legend>

            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="e.g., CIT Annual Tech Symposium & Hackathon"
                    className={
                      errors.title
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                    aria-invalid={!!errors.title}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              )}
            />

            <div className="grid gap-3 sm:grid-cols-2 items-start">
              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="slug" className="text-sm font-medium">
                      Slug
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        /events/
                      </span>
                      <Input
                        id="slug"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="auto-generated"
                        className="pl-24 h-10"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Auto-generated from title
                    </p>
                  </div>
                )}
              />

              <ComboboxField
                name="categoryId"
                label="Category *"
                control={control}
                options={categories}
                valueKey="id"
                labelKey="label"
                placeholder="Select category"
                searchPlaceholder="Search categories..."
                error={errors.categoryId?.message}
              />
            </div>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description (HTML)
                  </Label>
                  <Textarea
                    id="description"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    rows={6}
                    placeholder="Full event description with HTML formatting..."
                  />
                  <p className="text-xs text-slate-500">
                    Supports basic HTML: p, h3, ul, ol, a, strong, em
                  </p>
                </div>
              )}
            />
          </fieldset>

          <Separator className="my-2" />

          {/* Section: Date & Location */}
          <fieldset className="space-y-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wide">
              <span className="h-6 w-6 flex items-center justify-center rounded bg-slate-100 text-slate-600">
                3
              </span>
              Date & Location
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="startDate"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Start Date & Time *
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={
                        errors.startDate
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      aria-invalid={!!errors.startDate}
                    />
                    {errors.startDate && (
                      <p className="text-xs text-red-500">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="endDate"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      End Date & Time
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Optional — leave blank for single-day events
                    </p>
                  </div>
                )}
              />
            </div>

            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Location *
                  </Label>
                  <Input
                    id="location"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="e.g., Main Auditorium, CIT Campus"
                    className={
                      errors.location
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                    aria-invalid={!!errors.location}
                  />
                  {errors.location && (
                    <p className="text-xs text-red-500">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              )}
            />
          </fieldset>

          <Separator className="my-2" />

          {/* Section: Visibility Settings */}
          <fieldset className="space-y-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wide">
              <span className="h-6 w-6 flex items-center justify-center rounded bg-slate-100 text-slate-600">
                4
              </span>
              Visibility Settings
            </legend>

            <div className="rounded-lg bg-slate-50/50 p-4 space-y-3 border border-slate-100">
              <div className="grid gap-3 sm:grid-cols-2">
                <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white border border-slate-200 hover:border-[#8B1A1A]/50 transition-colors">
                      <Switch
                        id="isPublished"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Publish immediately
                        </p>
                        <p className="text-xs text-slate-500">
                          Event appears on public listings
                        </p>
                      </div>
                    </label>
                  )}
                />

                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white border border-slate-200 hover:border-[#8B1A1A]/50 transition-colors">
                      <Switch
                        id="isFeatured"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Feature on hero
                        </p>
                        <p className="text-xs text-slate-500">
                          Show in hero spotlight section
                        </p>
                      </div>
                    </label>
                  )}
                />
              </div>
            </div>
          </fieldset>

          <DialogFooter className="flex gap-3 justify-end border-t pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="w-40 bg-[#8B1A1A] hover:bg-[#6B1515]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
