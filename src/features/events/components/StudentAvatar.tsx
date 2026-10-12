"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface StudentAvatarProps {
  url?: string | null;
  name: string;
  initials: string;
  className?: string;
  size?: number;
}

export default function StudentAvatar({
  url,
  name,
  initials,
  className,
  size = 32,
}: StudentAvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-micro font-bold text-muted-foreground",
        className,
      )}
    >
      {url && !failed ? (
        <Image
          src={url}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
