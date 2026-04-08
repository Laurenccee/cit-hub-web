'use client';

import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  maxSize = 512,
  quality = 0.85,
): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise<void>((resolve) => {
    image.onload = () => resolve();
  });
  const scale = Math.min(
    maxSize / pixelCrop.width,
    maxSize / pixelCrop.height,
    1,
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      'image/jpeg',
      quality,
    );
  });
}

interface Props {
  onFile?: (blob: Blob) => void;
  initialUrl?: string;
}

export default function ProfilePictureDropzone({ onFile, initialUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const openCropper = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setCropSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleConfirmCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    const src = cropSrc;
    setCropSrc(null);
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels);
      setPreview(URL.createObjectURL(blob));
      onFile?.(blob);
    } catch {
      toast.error('Failed to process image.');
    }
  };

  return (
    <>
      <div
        className={cn(
          'relative w-full aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors overflow-hidden',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 hover:border-primary/50',
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) openCropper(file);
        }}
      >
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!preview && (
          <>
            <ImagePlus size={24} className="text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground text-center px-2">
              {isDragging ? 'Drop to upload' : 'Click or drag to upload'}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) openCropper(file);
            e.target.value = '';
          }}
        />
      </div>

      <Dialog
        open={!!cropSrc}
        onOpenChange={(open) => !open && setCropSrc(null)}
      >
        <DialogContent className="max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Crop Photo</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCropSrc(null)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmCrop}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
