"use client";

import { Controller } from "react-hook-form";
import { Camera, Check, TriangleAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageDropzone from "@/components/shared/ImageDropzone";

const DROPZONE_INPUT_ID = "student-setup-photo-input";

interface ProfilePictureStepProps {
  control: ReturnType<typeof import("react-hook-form").useForm<any>>["control"];
  isPending: boolean;
  profilePreviewUrl: string;
  onProfilePreviewChange: (url: string) => void;
  pendingBlobRef: React.MutableRefObject<Blob | null>;
}

const TIPS = [
  {
    icon: Check,
    iconClass: "bg-emerald-100 text-emerald-600",
    title: "Clear & Centered",
    description: "Face looking directly at the camera with good lighting.",
  },
  {
    icon: Check,
    iconClass: "bg-emerald-100 text-emerald-600",
    title: "Neutral Backdrop",
    description: "Plain wall or uncluttered background works best.",
  },
  {
    icon: TriangleAlert,
    iconClass: "bg-amber-100 text-amber-600",
    title: "No Sunglasses",
    description: "Avoid hats, heavily tinted glasses, or extreme filters.",
  },
];

export function ProfilePictureStep({
  control,
  profilePreviewUrl,
  onProfilePreviewChange,
  pendingBlobRef,
}: ProfilePictureStepProps) {
  const openFileDialog = () => {
    document.getElementById(DROPZONE_INPUT_ID)?.click();
  };

  return (
    <Controller
      name="profilePictureUrl"
      control={control}
      render={({ field }) => {
        const handleBlob = (blob: Blob | null) => {
          if (!blob) return;
          pendingBlobRef.current = blob;
          const url = URL.createObjectURL(blob);
          onProfilePreviewChange(url);
          field.onChange(url);
        };

        return (
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="rounded-full bg-muted/50 p-2.5">
                <div className="size-72 sm:size-80">
                  <ImageDropzone
                    variant="onboarding"
                    inputId={DROPZONE_INPUT_ID}
                    initialUrl={profilePreviewUrl || field.value}
                    onFile={handleBlob}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={openFileDialog}
                aria-label="Upload photo"
                className="absolute right-4 bottom-4 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-card transition-transform hover:scale-105"
              >
                <Camera className="size-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                JPG, PNG, or WebP
              </span>
              <span className="flex items-center gap-4">
                <span>
                  Max size:{" "}
                  <span className="font-semibold text-foreground">5 MB</span>
                </span>
                <span aria-hidden>•</span>
                <span>
                  Recommended:{" "}
                  <span className="font-semibold text-foreground">
                    800 × 800 px
                  </span>
                </span>
              </span>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={openFileDialog}
              className="gap-1.5 rounded-full"
            >
              <Upload className="size-4" />
              Browse Files
            </Button>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              {TIPS.map((tip) => (
                <div
                  key={tip.title}
                  className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-4 text-left"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`flex size-5 items-center justify-center rounded-full ${tip.iconClass}`}
                    >
                      <tip.icon className="size-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {tip.title}
                    </span>
                  </span>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
