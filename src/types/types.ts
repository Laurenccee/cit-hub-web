export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl: string;
  imageAlt: string;
  date: string | Date;
  category: 'Announcement' | 'Academic' | 'Achievement';
  slug: string;
  variant?: 'featured' | 'grid';
}
export interface NewsCardProps {
  news: NewsItem;
  variant?: 'featured' | 'grid' | 'list';
  priority?: boolean;
}

export interface EventItemProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  date: string | Date;
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
  section: string | Date;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string;
  endTime: string;
  status: 'Ongoing' | 'Upcoming' | 'Done' | 'Cancelled';
}
