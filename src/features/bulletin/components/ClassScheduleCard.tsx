import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';
import { ScheduleItemProps } from '../../../types/types';

export default function ClassScheduleCard({
  schedule,
}: {
  schedule: ScheduleItemProps[];
}) {
  return (
    <Card className="gap-8">
      <CardHeader className="flex items-start justify-between">
        <CardTitle className="text-xl">Today's Schedule</CardTitle>
        <CardAction>
          <Badge>{schedule.length}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col">
        {schedule.map((scheduleItem) => (
          <div
            key={scheduleItem.id}
            className="grid grid-cols-6 items-center gap-2.5"
          >
            <div className="col-span-1 aspect-square rounded-md border"></div>
            <div className="col-span-4">
              <h1 className="text-lg text-primary leading-none">
                {scheduleItem.class}
              </h1>
              <p className="text-sm text-muted-foreground">
                {scheduleItem.room} - {scheduleItem.type}
              </p>
              <p className="text-sm text-muted-foreground/80">
                {scheduleItem.startTime} – {scheduleItem.endTime}
              </p>
            </div>
            <div className="col-span-1">
              <Badge>{scheduleItem.status}</Badge>
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
