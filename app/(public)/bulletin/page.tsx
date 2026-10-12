import { Card, CardContent } from "@/components/ui/card";
import NewsCard from "@/features/bulletin/components/NewsCard";
import { Suspense } from "react";
import { NewsHero } from "@/features/bulletin/components/NewsHero";
import NewsCardSkeleton from "@/features/bulletin/components/skeletons/NewsCardSkeleton";
import { getBulletinPageData } from "@/features/bulletin/action/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import AddNewsButton from "@/features/bulletin/components/AddNewsButton";
import { PageContainer, PageHeader, PageSection } from "@/components/layouts/PageLayout";

const FILTERS = [
  { label: "All Updates", variant: "default" as const },
  { label: "News", variant: "outline" as const },
  { label: "Events", variant: "outline" as const },
  { label: "Academic Advisories", variant: "outline" as const },
  { label: "Pioneers Club", variant: "outline" as const },
];

export default async function NewsAndAnnouncementsPage() {
  const { contentTypes, featuredNews, news } = await getBulletinPageData();

  return (
    <PageSection>
      <PageContainer className="gap-8">
        {/* Featured Article Section */}
        <div className="overflow-hidden rounded-xl border bg-card">
          {featuredNews && featuredNews.length > 0 ? (
            <NewsHero news={featuredNews[0]} />
          ) : (
            <Card className="flex min-h-48 items-center justify-center border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No news published yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Published news will appear here as the featured article.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* School Bulletin Section */}
        <div className="flex flex-col gap-6">
          <div className="border-b pb-3">
            <PageHeader
              title="School Bulletin"
              description="Stay updated with the latest news, official notices, and events across the CIT community. Check out our archive for important student circulars and academic advisories."
              actions={
                <div className="flex w-full gap-4 sm:w-72">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search announcements, news..." className="pl-9" />
                  </div>
                  <AddNewsButton contentTypes={contentTypes} />
                </div>
              }
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <Badge
                  key={filter.label}
                  variant={filter.variant}
                  className="h-8 cursor-pointer px-3 text-sm hover:bg-accent"
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select className="flex h-8 items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option>Latest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 6).map((item) => (
              <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
                <NewsCard news={item} contentTypes={contentTypes} />
              </Suspense>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1.5 border-t pt-4">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" className="h-9 w-9 rounded-full text-sm">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full text-sm">
              2
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full text-sm">
              3
            </Button>
            <span className="text-sm text-muted-foreground">...</span>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PageContainer>
    </PageSection>
  );
}
