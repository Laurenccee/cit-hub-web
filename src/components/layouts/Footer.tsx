"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const isSetup = pathname.startsWith("/personnel/setup");
  if (isSetup) return null;

  return (
    <footer className="mx-auto w-full border-t-2 py-8 bg-mauve-950 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} CIT Hub. All rights reserved.
    </footer>
  );
}
