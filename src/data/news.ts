import { NewsItem } from '../types/types';

export const LATEST_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'CIT Robotics Team Wins National Championship',
    date: '2026-10-23', // String format works with our formatter
    description:
      'Congratulations to our robotics team for their outstanding performance at the National Robotics Competition, where they secured first place against top teams from across the country!',
    imageUrl: '/images/news1.jpg',
    imageAlt: 'CIT students celebrating their robotics win',
    category: 'Achievement',
    slug: '/news/robotics-win',
  },
  {
    id: '2',
    title: 'New Seminar: AI in Industrial Technology',
    date: '2026-11-05', // String format works with our formatter
    description:
      'Join us for a deep dive into how Artificial Intelligence is reshaping the landscape of modern industry.',
    imageUrl: '/images/news1.jpg',
    imageAlt: 'AI seminar promotional poster',
    category: 'Announcement',
    slug: '/news/ai-seminar',
  },
  {
    id: '3',
    title: 'CIT Launches New Cybersecurity Program',
    date: '2026-09-15',
    description:
      'In response to the growing demand for cybersecurity professionals, CIT is proud to announce the launch of our new program focused on cybersecurity and information assurance.',
    imageUrl: '/images/news1.jpg',
    imageAlt: 'Cybersecurity program launch event',
    category: 'Announcement',
    slug: '/news/cybersecurity-program',
  },
  {
    id: '4',
    title: 'CIT Students Present Research at International Conference',
    date: '2026-10-10',
    description:
      'A team of our IT students recently presented their groundbreaking research on sustainable technology solutions at the International Tech Conference in Singapore.',
    imageUrl: '/images/news1.jpg',
    imageAlt: 'CIT students presenting research at conference',
    category: 'Academic',
    slug: '/news/research-presentation',
  },
  {
    id: '5',
    title: 'CIT Hosts Annual Tech Career Fair',
    date: '2026-11-20',
    description:
      'Join us for our annual technology career fair, where you can connect with top employers and explore exciting opportunities in the tech industry.',
    imageUrl: '/images/news1.jpg',
    imageAlt: 'CIT annual tech career fair event',
    category: 'Announcement',
    slug: '/news/career-fair',
  },
  {
    id: '6',
    title: 'CIT IT Department Receives Grant for Research on Renewable Energy',
    date: '2026-09-30',
    description:
      'We are thrilled to announce that the IT department at CIT has been awarded a significant grant to conduct research on innovative renewable energy solutions.',
    imageUrl: '/images/news1.jpg',
    imageAlt: 'CIT IT department receiving grant for renewable energy research',
    category: 'Academic',
    slug: '/news/renewable-energy-grant',
  },
  {
    id: '7',
    title: 'CIT Students Volunteer for Community Tech Outreach Program',
    date: '2026-10-18',
    description:
      'Our students are making a difference in their community by volunteering for our technology outreach program, bringing digital literacy to underserved areas.',
    imageUrl: '/images/news1.jpg',
    imageAlt: 'CIT students volunteering for community tech outreach',
    category: 'Achievement',
    slug: '/news/community-outreach',
  },
];
