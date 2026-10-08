"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { EventItem } from "../types";
import EventCover from "./EventCover";

interface EventImageProps {
  event: Pick<EventItem, "title" | "image_url" | "image_alt" | "cover">;
  className?: string;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Photo-first event visual: renders the uploaded `image_url` when present
 * (falling back to generated art if it fails to load), otherwise renders
 * the CSS-art `EventCover`.
 */
export default function EventImage({
  event,
  className,
  rounded = "rounded-none",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: EventImageProps) {
  const [failed, setFailed] = useState(false);

  if (!event.image_url || failed) {
    return <EventCover cover={event.cover} className={className} rounded={rounded} />;
  }

  return (
    <div className={cn("relative w-full overflow-hidden", rounded, className)}>
      <Image
        src={event.image_url}
        alt={event.image_alt ?? event.title}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
