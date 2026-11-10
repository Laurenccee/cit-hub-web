"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";

interface RouteErrorProps {
  error: unknown;
  retry: () => void;
}

function getDigest(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" ? digest : undefined;
}

/** Shared fallback UI for route-segment error boundaries. */
export function RouteError({ error, retry }: RouteErrorProps) {
  const digest = getDigest(error);

  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-title">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load this page. You can try again, or head back to the
        home page.
      </p>
      {digest && (
        <p className="font-mono text-xs text-muted-foreground">
          Reference: {digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={() => retry()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.HOME}>Go home</Link>
        </Button>
      </div>
    </section>
  );
}
