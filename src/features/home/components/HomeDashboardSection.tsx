import ClassScheduleCard from './ClassScheduleCard';
import UpcomingEventsCard from './UpcomingEventsCard';
import { formatDayDate } from '@/utils/formatters';
import type { EventItemProps } from '../types';

interface HomeDashboardSectionProps {
    upcomingEvents: EventItemProps[];
}

export default function HomeDashboardSection({ upcomingEvents }: HomeDashboardSectionProps) {
    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-section text-foreground">Dashboard</h2>
                <span className="text-sm text-muted-foreground">{formatDayDate(new Date())}</span>
            </div>

            <ClassScheduleCard schedule={[]} />
            <UpcomingEventsCard events={upcomingEvents} />
        </section>
    );
}
