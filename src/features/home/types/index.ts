export interface EventItemProps {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    imageAlt: string;
    date: string;
    startTime: string;
    endTime: string;
    slug: string;
}

export interface ScheduleItemProps {
    id: string;
    class: string;
    type: 'Lecture' | 'Lab';
    room: string;
    course: string;
    major: string;
    year: string;
    section: string;
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    startTime: string;
    endTime: string;
    status: 'Ongoing' | 'Upcoming' | 'Done' | 'Cancelled';
}
