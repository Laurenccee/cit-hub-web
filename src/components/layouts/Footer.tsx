"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const isSetup =
    pathname.startsWith("/personnel/setup") || pathname.startsWith("/student/setup");
  if (isSetup) return null;

  return (
    <footer className="w-full border-t bg-card py-8 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} CIT Hub. All rights reserved.
    </footer>
  );
}
