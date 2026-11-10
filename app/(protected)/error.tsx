"use client";

import { RouteError } from "@/components/shared/RouteError";

export default function ProtectedError(props: {
  error: unknown;
  retry: () => void;
}) {
  return <RouteError {...props} />;
}
