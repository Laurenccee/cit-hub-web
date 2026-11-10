'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import type { Area, Point } from 'react-easy-crop';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// The cropper (react-easy-crop) is only needed once a file is picked.
const ImageCropDialog = dynamic(() => import('./ImageCropDialog'), { ssr: false });

export interface ImageDropzoneProps {
    variant?: 'avatar' | 'news' | 'onboarding';
    onFile?: (blob: Blob | null) => void;
    initialUrl?: string;
    inputId?: string;
}

// ─── crop helper ─────────────────────────────────────────────────────────────

async function getCroppedBlob(
    imageSrc: string,
    pixelCrop: Area,
    variant: 'avatar' | 'news' | 'onboarding',
    quality = 0.85,
): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;
    await new Promise<void>((resolve) => {
        image.onload = () => resolve();
    });

    const scale =
        variant === 'avatar'
            ? Math.min(512 / pixelCrop.width, 512 / pixelCrop.height, 1)
            : Math.min(1200 / pixelCrop.width, 1);

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
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
            'image/jpeg',
            quality,
        );
    });
}

// ─── variant config ───────────────────────────────────────────────────────────

const VARIANT_CONFIG = {
    avatar: {
        aspect: 1 as const,
        cropperAspect: 1 as const,
        containerClass:
            'relative h-full aspect-square max-h-full rounded-full border flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors overflow-hidden',
        dialogMaxW: 'max-w-sm',
        showClear: false,
        showDescription: false,
        cropPreviewClass: 'relative w-full aspect-square bg-black rounded-md overflow-hidden',
    },
    news: {
        aspect: 16 / 9,
        cropperAspect: 16 / 9,
        containerClass:
            'relative w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors overflow-hidden',
        dialogMaxW: 'max-w-lg',
        showClear: true,
        showDescription: true,
        cropPreviewClass: 'relative w-full aspect-video bg-black rounded-md overflow-hidden',
    },
    onboarding: {
        aspect: 1 as const,
        cropperAspect: 1 as const,
        containerClass:
            'relative h-full aspect-square max-h-full rounded-full border-2 border-dashed border-primary/30 bg-primary/[0.03] flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors overflow-hidden hover:border-primary/50',
        dialogMaxW: 'max-w-sm',
        showClear: false,
        showDescription: false,
        cropPreviewClass: 'relative w-full aspect-square bg-black rounded-md overflow-hidden',
    },
} satisfies Record<string, object>;

type Variant = NonNullable<ImageDropzoneProps['variant']>;

function useCropper(
    variant: Variant,
    onCropped: (blob: Blob) => void,
) {
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

    const closeCropper = () => setCropSrc(null);

    const confirmCrop = async () => {
        if (!cropSrc || !croppedAreaPixels) return;
        const src = cropSrc;
        setCropSrc(null);
        try {
            onCropped(await getCroppedBlob(src, croppedAreaPixels, variant));
        } catch {
            toast.error('Failed to process image.');
        }
    };

    return { cropSrc, crop, zoom, setCrop, setZoom, onCropComplete, openCropper, closeCropper, confirmCrop };
}

function DropzonePlaceholder({ variant, isDragging }: { variant: Variant; isDragging: boolean }) {
    if (variant === 'onboarding') {
        return (
            <>
                <span className="flex size-16 items-center justify-center rounded-full bg-card shadow-sm">
                    <ImagePlus size={28} className="text-primary" />
                </span>
                <span className="flex flex-col gap-1 px-6 text-center">
                    <span className="text-base font-semibold text-foreground">
                        {isDragging ? 'Drop photo here' : 'Click or drag photo here'}
                    </span>
                    <span className="text-xs text-muted-foreground">High-res portrait preferred</span>
                </span>
            </>
        );
    }
    return (
        <>
            <ImagePlus size={24} className="text-muted-foreground/50" />
            <p
                className={cn(
                    'text-muted-foreground text-center px-2',
                    variant === 'avatar' ? 'text-micro' : 'text-xs',
                )}
            >
                {isDragging ? 'Drop to upload' : 'Click or drag to upload'}
            </p>
        </>
    );
}

function DropzonePreview({
    preview,
    showClear,
    onClear,
}: {
    preview: string;
    showClear: boolean;
    onClear: (e: React.MouseEvent) => void;
}) {
    return (
        <>
            <NextImage src={preview} alt="Preview" fill unoptimized className="object-cover" />
            {showClear && (
                <button
                    type="button"
                    onClick={onClear}
                    className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-primary-foreground hover:bg-black/80 transition-colors"
                    aria-label="Remove image"
                >
                    <X size={14} />
                </button>
            )}
        </>
    );
}

export default function ImageDropzone({ variant = 'avatar', onFile, initialUrl, inputId }: ImageDropzoneProps) {
    const config = VARIANT_CONFIG[variant];

    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
    const [isDragging, setIsDragging] = useState(false);

    const cropper = useCropper(variant, (blob) => {
        setPreview(URL.createObjectURL(blob));
        onFile?.(blob);
    });
    const { openCropper } = cropper;

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onFile?.(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <>
            <div
                className={cn(
                    config.containerClass,
                    isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50',
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
                {preview ? (
                    <DropzonePreview preview={preview} showClear={config.showClear} onClear={handleClear} />
                ) : (
                    <DropzonePlaceholder variant={variant} isDragging={isDragging} />
                )}
                <input
                    ref={inputRef}
                    id={inputId}
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

            {cropper.cropSrc && <ImageCropDialog variant={variant} config={config} cropper={cropper} />}
        </>
    );
}
