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
import { ScheduleItemProps } from '../../../types/types';

export default function ClassScheduleCard({
  schedule,
}: {
  schedule: ScheduleItemProps[];
}) {
  const today = new Date().getDay() || 7;

  const classesToday = schedule.filter(
    (item) => item.dayOfWeek === today,
  ).length;
  return (
    <Card className="gap-8">
      <CardHeader className="flex items-start justify-between">
        <CardTitle className="text-xl">Todays's Schedule</CardTitle>
        <CardAction>
          <Badge>{classesToday}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col">
        {schedule.map((item) => (
          <div key={item.id} className="grid grid-cols-6 items-center gap-2.5">
            <div className="col-span-1 aspect-square rounded-md border"></div>
            <div className="col-span-4">
              <h1 className="text-lg text-primary leading-none">
                {item.class}
              </h1>
              <p className="text-sm text-muted-foreground">
                {item.room} - {item.type}
              </p>
              <p className="text-sm text-muted-foreground/80">
                {item.startTime}AM - {item.endTime}PM
              </p>
            </div>
            <div className="col-span-1">
              <Badge>{item.status}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button size="lg" variant="secondary" className="w-full h-10 text-sm">
          View Full Schedule
        </Button>
      </CardFooter>
    </Card>
  );
}
