import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventCheckInButtonsProps {
  eventId: string;
  /** Primary action label. Defaults to "Check In". */
  checkInLabel?: string;
  /** Secondary action label. Defaults to "Check Out". */
  checkOutLabel?: string;
}

/**
 * The paired check-in / check-out links into an event's gate terminal. Shared
 * so the public detail page and the live attendance rail stay in sync.
 */
export function EventCheckInButtons({
  eventId,
  checkInLabel = "Check In",
  checkOutLabel = "Check Out",
}: EventCheckInButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        size="sm"
        className="h-9 gap-1.5 text-xs font-semibold"
        asChild
      >
        <Link href={`/events/${eventId}/login`}>
          <LogIn className="h-3.5 w-3.5" />
          {checkInLabel}
        </Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 gap-1.5 text-xs font-semibold"
        asChild
      >
        <Link href={`/events/${eventId}/logout`}>
          <LogOut className="h-3.5 w-3.5" />
          {checkOutLabel}
        </Link>
      </Button>
    </div>
  );
}
