'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Camera, Check, TriangleAlert, Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ImageDropzone from '@/components/shared/ImageDropzone';

const DROPZONE_INPUT_ID = 'onboarding-photo-input';

interface ProfilePictureStepProps {
  control: ReturnType<typeof import('react-hook-form').useForm<any>>['control'];
  isPending: boolean;
  profilePreviewUrl: string;
  onProfilePreviewChange: (url: string) => void;
  pendingBlobRef: React.MutableRefObject<Blob | null>;
}

const TIPS = [
  {
    icon: Check,
    iconClass: 'bg-emerald-100 text-emerald-600',
    title: 'Clear & Centered',
    description: 'Face looking directly at the camera with good lighting.',
  },
  {
    icon: Check,
    iconClass: 'bg-emerald-100 text-emerald-600',
    title: 'Neutral Backdrop',
    description: 'Plain wall, clean office, or uncluttered background.',
  },
  {
    icon: TriangleAlert,
    iconClass: 'bg-amber-100 text-amber-600',
    title: 'No Sunglasses',
    description: 'Avoid hats, heavily tinted glasses, or extreme filters.',
  },
];

export function ProfilePictureStep({
  control,
  profilePreviewUrl,
  onProfilePreviewChange,
  pendingBlobRef,
}: ProfilePictureStepProps) {
  const [webcamOpen, setWebcamOpen] = useState(false);

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
                  Max size: <span className="font-semibold text-foreground">5 MB</span>
                </span>
                <span aria-hidden>•</span>
                <span>
                  Recommended: <span className="font-semibold text-foreground">800 × 800 px</span>
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button type="button" variant="secondary" onClick={openFileDialog} className="gap-1.5 rounded-full">
                <Upload className="size-4" />
                Browse Files
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setWebcamOpen(true)}
                className="gap-1.5 rounded-full"
              >
                <Video className="size-4" />
                Take with Webcam
              </Button>
            </div>

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
                    <span className="text-sm font-semibold text-foreground">{tip.title}</span>
                  </span>
                  <p className="text-xs leading-relaxed text-muted-foreground">{tip.description}</p>
                </div>
              ))}
            </div>

            <WebcamDialog
              open={webcamOpen}
              onOpenChange={setWebcamOpen}
              onCapture={handleBlob}
            />
          </div>
        );
      }}
    />
  );
}

function WebcamDialog({
  open,
  onOpenChange,
  onCapture,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (blob: Blob) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);

    const stopStream = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera access.');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 800 }, height: { ideal: 800 }, facingMode: 'user' },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        if (!cancelled) setError('Camera unavailable. Check permissions and try again.');
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open ]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      toast.error('Camera is not ready yet.');
      return;
    }
    setIsCapturing(true);
    try {
      const side = Math.min(video.videoWidth, video.videoHeight);
      const sx = (video.videoWidth - side) / 2;
      const sy = (video.videoHeight - side) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.drawImage(video, sx, sy, side, side, 0, 0, 800, 800);
      canvas.toBlob(
        (blob) => {
          setIsCapturing(false);
          if (!blob) {
            toast.error('Failed to capture photo.');
            return;
          }
          onCapture(blob);
          onOpenChange(false);
        },
        'image/jpeg',
        0.9,
      );
    } catch {
      setIsCapturing(false);
      toast.error('Failed to capture photo.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Take a photo</DialogTitle>
          <DialogDescription>Center your face in the frame, then capture.</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
          {error ? (
            <p className="flex h-full items-center justify-center p-6 text-center text-sm text-white">
              {error}
            </p>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCapture} disabled={!!error || isCapturing}>
            <Camera className="size-4" />
            {isCapturing ? 'Capturing...' : 'Capture'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
