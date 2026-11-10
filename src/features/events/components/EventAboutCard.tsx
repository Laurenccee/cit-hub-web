import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventItem } from "../types";

function EventDescription({ event }: { event: EventItem }) {
  if (event.content) {
    return <div dangerouslySetInnerHTML={{ __html: event.content }} />;
  }
  if (event.description) {
    return <p className="whitespace-pre-wrap">{event.description}</p>;
  }
  return <p className="text-muted-foreground/70">No description available.</p>;
}

export function EventAboutCard({ event }: { event: EventItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-subtitle">About this Event</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="max-w-none text-sm leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-6 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:text-foreground [&_li]:mt-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
          <EventDescription event={event} />
        </div>
      </CardContent>
    </Card>
  );
}
