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

export default async function NewsAndAnnouncementsPage() {
  const { contentTypes, featuredNews, news } = await getBulletinPageData();

  return (
    <section className="flex flex-col py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Featured Article Section */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          {featuredNews && featuredNews.length > 0 ? (
            <NewsHero news={featuredNews[0]} />
          ) : (
            <Card className="flex items-center justify-center min-h-48 bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center gap-2 text-center py-8">
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                School Bulletin
              </h1>
              <p className="max-w-2xl text-muted-foreground">
                Stay updated with the latest news, official notices, and events
                across the CIT community. Check out our archive for important
                student circulars and academic advisories.
              </p>
            </div>
            <div className="flex gap-4 w-full sm:w-72">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements, news..."
                  className="pl-9"
                />
              </div>
              <AddNewsButton contentTypes={contentTypes} />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="default"
                className="cursor-pointer h-8 px-3 text-sm"
              >
                All Updates
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent h-8 px-3 text-sm"
              >
                News
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent h-8 px-3 text-sm"
              >
                Events
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent h-8 px-3 text-sm"
              >
                Academic Advisories
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent h-8 px-3 text-sm"
              >
                Pioneers Club
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select className="flex h-8 items-center justify-between rounded-lg border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option>Latest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.slice(0, 6).map((item) => (
              <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
                <NewsCard
                  key={item.id}
                  news={item}
                  contentTypes={contentTypes}
                />
              </Suspense>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1.5 pt-4 border-t">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 rounded-full"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="w-9 h-9 rounded-full text-sm"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 rounded-full text-sm"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 rounded-full text-sm"
            >
              3
            </Button>
            <span className="text-muted-foreground text-sm">...</span>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
