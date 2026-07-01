import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { CardEmptyState } from '@/components/shared/CardEmptyState';
import { EventItemProps } from '../../../types';
import { formatDayDate } from '@/utils/formatters';
import { CalendarX } from 'lucide-react';

export default function UpcomingEventsCard({ events = [] }: { events: EventItemProps[] }) {
    const hasEvents = events && events.length > 0;

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex items-start justify-between">
                <CardTitle className="text-xl">Upcoming Events</CardTitle>
            </CardHeader>

            <CardContent className="gap-4 flex flex-col flex-1">
                {hasEvents ? (
                    events.slice(0, 5).map((event) => (
                        <div key={event.id} className="grid grid-cols-6 items-center gap-2.5 group">
                            <div className="col-span-1 flex flex-col bg-accent justify-center items-center aspect-square rounded-md border transition-colors group-hover:bg-primary/10">
                                <span className="text-[10px] leading-none uppercase text-primary font-semibold">
                                    {formatDayDate(event.date, 'MMM')}
                                </span>
                                <p className="font-bold text-lg">{formatDayDate(event.date, 'dd')}</p>
                            </div>

                            <div className="col-span-5">
                                <h1 className="text-sm lg:text-base font-medium text-primary leading-tight">
                                    {event.title}
                                </h1>
                                <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 mt-0.5">
                                    <span className="shrink-0">
                                        {event.startTime} – {event.endTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <CardEmptyState
                        icon={<CalendarX className="h-6 w-6 text-muted-foreground" />}
                        title="No upcoming events"
                        description="Check back later for updates."
                    />
                )}
            </CardContent>

            <CardFooter className="mt-auto">
                <Button size="lg" variant="secondary" className="w-full h-10 text-sm" disabled={!hasEvents}>
                    View All Events
                </Button>
            </CardFooter>
        </Card>
    );
}
