import { ScheduleItemProps } from '../types/types';

export const CLASS_SCHEDULES: ScheduleItemProps[] = [
  {
    id: '1',
    class: 'History 101',
    type: 'Lecture',
    room: 'Room 101',
    course: 'BSIT',
    major: 'Automotive Technology',
    year: '2',
    section: 'A',
    dayOfWeek: 2,
    startTime: '10:00',
    endTime: '11:00',
    status: 'Ongoing',
  },
  {
    id: '2',
    class: 'Math 101',
    type: 'Lab',
    room: 'Room 202',
    course: 'BSIT',
    major: 'Automotive Technology',
    year: '2',
    section: 'A',
    dayOfWeek: 2,
    startTime: '11:00',
    endTime: '12:00',
    status: 'Ongoing',
  },
];
