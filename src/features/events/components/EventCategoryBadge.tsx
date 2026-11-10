import { Badge } from "@/components/ui/badge";

interface EventCategoryBadgeProps {
  color?: string | null;
  label: string;
}

/** Category chips carry an author-defined hex from the DB, so the tint is applied inline. */
export function EventCategoryBadge({ color, label }: EventCategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="max-w-fit rounded-full px-2.5 py-1 text-micro font-semibold"
      style={
        color
          ? {
              color,
              borderColor: "transparent",
              backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
            }
          : undefined
      }
    >
      {label}
    </Badge>
  );
}
