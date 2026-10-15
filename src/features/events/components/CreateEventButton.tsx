"use client";

import CreateEventDialog from "@/features/events/components/CreateEventDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { EventCategory } from "@/features/events/types";

export default function CreateEventButton({
  categories,
}: {
  categories: EventCategory[];
}) {
  const { isAdmin } = useAuth();
  return (
    <CreateEventDialog categories={categories}>
      {isAdmin && (
        <Button className="h-9 shrink-0 gap-1.5 text-xs font-semibold">
          <Plus className="h-4 w-4" />
          Create New Event
        </Button>
      )}
    </CreateEventDialog>
  );
}
