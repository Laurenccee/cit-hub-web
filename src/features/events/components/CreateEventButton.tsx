"use client";

import CreateEventDialog from "@/features/events/components/CreateEventDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function CreateEventButton() {
  const { isAdmin } = useAuth();
  return (
    <CreateEventDialog>
      {isAdmin && (
        <Button className="h-9 shrink-0 gap-1.5 bg-[#8B1A1A] text-xs font-semibold hover:bg-[#6B1515]">
          <Plus className="h-4 w-4" />
          Create New Event
        </Button>
      )}
    </CreateEventDialog>
  );
}
