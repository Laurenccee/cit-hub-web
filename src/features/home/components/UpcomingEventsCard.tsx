import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { EventItemProps } from '../../../types/types';
import { formatDayDate } from '@/utils/formatters';

export default function UpcomingEventsCard({
  events,
}: {
  events: EventItemProps[];
}) {
  return (
    <Card className="gap-8">
      <CardHeader className="flex items-start justify-between">
        <CardTitle className="text-xl">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col">
        {events.map((event) => (
          <div key={event.id} className="grid grid-cols-6 items-center gap-2.5">
            <div className="col-span-1 flex flex-col bg-accent justify-center items-center aspect-square rounded-md border">
              <h1 className="text-lg leading-3.5 uppercase text-primary">
                {formatDayDate(event.date, 'MMM')}
              </h1>
              <p className="font-bold">{formatDayDate(event.date, 'dd')}</p>
            </div>
            <div className="col-span-4">
              <h1 className="text-lg text-primary leading-none">
                {event.title}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {event.description}
              </p>
              <span className="flex items-center gap-1 text-sm text-muted-foreground/80">
                {event.startTime} – {event.endTime}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button size="lg" variant="secondary" className="w-full h-10 text-sm">
          View All Events
        </Button>
      </CardFooter>
    </Card>
  );
}
