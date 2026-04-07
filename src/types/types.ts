import type { Tables } from './database.types';

export type Rank = Tables<'ranks'>;
export type Designation = Tables<'designations'>;
export type LookupOption = { id: number; name: string; slug?: string };

export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface EducationEntry {
  degree: string;
  major?: string;
  institution: string;
  yearGraduated?: number;
  onGoing: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl: string;
  imageAlt: string;
  date: string;
  slug: string;
  typesId: number;
  isPublished: boolean;
  isFeatured: boolean;
}
export interface NewsCardProps {
  news: NewsItem;
  contentTypes?: LookupOption[];
  variant?: 'featured' | 'grid' | 'list';
  priority?: boolean;
}

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

export interface Personnel {
  id: string;
  employeeId: string;
  email: string;
  name: string;

  rank: Rank;
  designation?: Designation | null;
  office: string;
  contactNumber: string;
  socialMedia: SocialMedia;

  education: EducationEntry[];

  profilePictureUrl?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  createdAt?: string;
}
