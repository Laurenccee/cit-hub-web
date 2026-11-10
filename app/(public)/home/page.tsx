import { getBulletinPageData } from '@/features/bulletin/action/queries';
import { GetUpcomingEvents } from '@/features/events/action/queries';
import HomeDashboardSection from '@/features/home/components/HomeDashboardSection';
import HomeNewsSection from '@/features/home/components/HomeNewsSection';
import { UPCOMING_EVENTS_LIMIT, getUpcomingEvents } from '@/features/home/utils';
import { Badge } from '@/components/ui/badge';
import { PageContainer, PageHeader, PageSection } from '@/components/layouts/PageLayout';

// The home page shows a featured story plus the two newest.
const HOME_NEWS_LIMIT = 2;

export default async function HomePage() {
    const [{ featuredNews, news }, eventsResult] = await Promise.all([
        getBulletinPageData({ newsLimit: HOME_NEWS_LIMIT }),
        GetUpcomingEvents(UPCOMING_EVENTS_LIMIT),
    ]);
    const events = eventsResult.success ? eventsResult.data : [];

    return (
        <PageSection>
            <PageContainer className="gap-8">
                <PageHeader
                    eyebrow={
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider">
                                Academic Overview
                            </Badge>
                            <span className="text-sm text-muted-foreground">CIT Pioneer Hub</span>
                        </div>
                    }
                    title="Welcome CIT Students"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <HomeNewsSection featuredNews={featuredNews} news={news} />
                    <HomeDashboardSection upcomingEvents={getUpcomingEvents(events)} />
                </div>
            </PageContainer>
        </PageSection>
    );
}
