import { EventItemProps } from '../types/types';

export const UPCOMING_EVENTS: EventItemProps[] = [
  {
    id: '1',
    title: 'CIT Hosts Annual Tech Career Fair',
    date: '2026-11-20',
    startTime: '10:00',
    endTime: '16:00',
    description:
      'Join us for our annual technology career fair, where you can connect with top employers and explore exciting opportunities in the tech industry.',
    imageUrl: '/images/career-fair.jpg',
    imageAlt: 'CIT annual tech career fair event',

    slug: '/news/career-fair',
  },
  {
    id: '2',
    title: 'CIT IT Department Receives Grant for Research on Renewable Energy',
    date: '2026-09-30',
    startTime: '09:00',
    endTime: '17:00',
    description:
      'We are thrilled to announce that the IT department at CIT has been awarded a significant grant to conduct research on innovative renewable energy solutions.',
    imageUrl: '/images/renewable-energy.jpg',
    imageAlt: 'CIT IT department receiving grant for renewable energy research',
    slug: '/news/renewable-energy-grant',
  },
  {
    id: '3',
    title: 'CIT Students Volunteer for Community Tech Outreach Program',
    date: '2026-10-18',
    startTime: '09:00',
    endTime: '17:00',
    description:
      'Our students are making a difference in their community by volunteering for our technology outreach program, bringing digital literacy to underserved areas.',
    imageUrl: '/images/community-outreach.jpg',
    imageAlt: 'CIT students volunteering for community tech outreach',
    slug: '/news/community-outreach',
  },
];
