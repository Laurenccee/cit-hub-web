import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';
import React from 'react';
import { EventItemProps } from '../../../types/types';
import { start } from 'repl';
import { formatDayDate } from '@/utils/formatters';
import { Clock } from 'lucide-react';

export default function UpcommingEventCards({
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
        {events.map((item) => (
          <div key={item.id} className="grid grid-cols-6 items-center gap-2.5">
            <div className="col-span-1 flex flex-col bg-accent justify-center items-center aspect-square rounded-md border">
              <h1 className="text-lg leading-3.5 uppercase text-primary">
                {formatDayDate(item.date, 'MMM')}
              </h1>
              <p className="font-bold">
                {formatDayDate(new Date(item.date), 'dd')}
              </p>
            </div>
            <div className="col-span-4">
              <h1 className="text-lg text-primary leading-none">
                {item.title}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {item.description}
              </p>
              <span className="flex items-center gap-1 text-sm text-muted-foreground/80">
                {item.startTime}AM - {item.endTime}PM
              </span>
              <span></span>
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
