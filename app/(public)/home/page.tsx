'use client';
import ClassShecduleCard from '@/features/home/components/ClassScheduleCard';
import { formatDayDate } from '@/utils/formatters';
import Link from 'next/link';
import NewsCard from '@/features/home/components/NewsCard';
import { LATEST_NEWS } from '@/data/news';
import { CLASS_SCHEDULES } from '@/data/schedule';
import { EVENTS_ITEM } from '@/data/events';
import UpcommingEventCards from '@/features/home/components/UpcommingEventsCard';

export default function HomePage() {
  const newsItem = LATEST_NEWS[0];
  const classesToday = CLASS_SCHEDULES.filter(
    (item) => item.dayOfWeek === new Date().getDay() || 7,
  );
  const today = formatDayDate(new Date());
  return (
    <div className="flex flex-col gap-16">
      <section>
        <span className="text-primary/80">Academic overview</span>
        <div className="flex justify-between">
          <h1 className="text-6xl text-mauve-800 tracking-wide leading-tighter">
            Welcome CIT Students
          </h1>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <section className="col-span-2 flex flex-col gap-4">
          <div className=" flex items-end justify-between">
            <h1 className="text-3xl text-primary">News & Announcements</h1>
            <Link
              href="/news"
              className=" flex gap-2.5 text-muted-foreground items-center border-b-2 border-transparent hover:text-primary hover:border-primary transition-all duration-200 ease-in-out"
            >
              View all news
            </Link>
          </div>

          <div className="flex flex-col gap-16">
            <NewsCard key={newsItem.id} news={newsItem} variant="featured" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {LATEST_NEWS.slice(1, 7).map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </div>
        </section>
        <section className="col-span-1 flex flex-col gap-8">
          <div className=" flex items-end justify-between">
            <h1 className="text-3xl text-primary">Student Dashboard</h1>
            <p className=" text-muted-foreground">{today}</p>
          </div>
          <div className=" flex flex-col gap-8">
            <ClassShecduleCard schedule={classesToday} />
            <UpcommingEventCards events={EVENTS_ITEM} />
          </div>
        </section>
      </div>
    </div>
  );
}
