"use client";

import { RouteError } from "@/components/shared/RouteError";

export default function Error(props: { error: unknown; retry: () => void }) {
  return <RouteError {...props} />;
}
