import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { ScheduleItemProps } from '../../../types/types';
import { Clock, BookOpenCheck } from 'lucide-react';

export default function ClassScheduleCard({
  schedule = [],
}: {
  schedule: ScheduleItemProps[];
}) {
  const hasSchedule = schedule && schedule.length > 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">Today's Schedule</CardTitle>
        {hasSchedule && (
          <Badge variant="outline" className="ml-2">
            {schedule.length} {schedule.length === 1 ? 'Class' : 'Classes'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="gap-4 flex flex-col flex-1">
        {hasSchedule ? (
          schedule.map((scheduleItem) => (
            <div
              key={scheduleItem.id}
              className="grid grid-cols-6 items-center gap-2.5 group"
            >
              <div className="col-span-1 flex items-center justify-center aspect-square rounded-md border bg-accent transition-colors group-hover:bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>

              <div className="col-span-4">
                <h1 className="text-base font-medium text-primary leading-tight">
                  {scheduleItem.class}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {scheduleItem.room} • {scheduleItem.type}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">
                  {scheduleItem.startTime} – {scheduleItem.endTime}
                </p>
              </div>

              <div className="col-span-1 flex justify-end">
                <Badge
                  variant={
                    scheduleItem.status === 'Cancelled'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className="text-[10px] px-1.5 py-0"
                >
                  {scheduleItem.status}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <div className="bg-muted rounded-full p-3">
              <BookOpenCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                No classes scheduled
              </p>
              <p className="text-xs text-muted-foreground/70">
                Enjoy your free time or catch up on studies!
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          size="lg"
          variant="secondary"
          className="w-full h-10 text-sm"
          disabled={!hasSchedule}
        >
          View Full Schedule
        </Button>
      </CardFooter>
    </Card>
  );
}
