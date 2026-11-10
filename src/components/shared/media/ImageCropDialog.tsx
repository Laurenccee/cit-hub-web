'use client';

import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageCropDialogProps {
    variant: 'avatar' | 'news' | 'onboarding';
    config: {
        dialogMaxW: string;
        showDescription: boolean;
        cropPreviewClass: string;
        cropperAspect: number;
    };
    cropper: {
        cropSrc: string | null;
        crop: Point;
        zoom: number;
        setCrop: (crop: Point) => void;
        setZoom: (zoom: number) => void;
        onCropComplete: (area: Area, areaPixels: Area) => void;
        closeCropper: () => void;
        confirmCrop: () => void;
    };
}

// Loaded on demand by ImageDropzone so react-easy-crop stays out of first-load JS.
export default function ImageCropDialog({ variant, config, cropper }: ImageCropDialogProps) {
    const { cropSrc, crop, zoom, setCrop, setZoom, onCropComplete, closeCropper, confirmCrop } = cropper;
    return (
        <Dialog open={!!cropSrc} onOpenChange={(open) => !open && closeCropper()}>
            <DialogContent className={config.dialogMaxW} showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Crop {variant === 'avatar' ? 'Photo' : 'Image'}</DialogTitle>
                    {config.showDescription && (
                        <DialogDescription>Adjust the crop area and zoom, then apply.</DialogDescription>
                    )}
                </DialogHeader>
                <div className={cn(config.cropPreviewClass)}>
                    {cropSrc && (
                        <Cropper
                            image={cropSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={config.cropperAspect}
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
                    <Button variant="outline" size="sm" onClick={closeCropper}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={confirmCrop}>
                        Apply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
