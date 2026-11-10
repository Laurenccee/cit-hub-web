"use client";

import { RouteError } from "@/components/shared/RouteError";

export default function PublicError(props: {
  error: unknown;
  retry: () => void;
}) {
  return <RouteError {...props} />;
}
