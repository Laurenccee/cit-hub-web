import { Card, CardContent } from "@/components/ui/card";
import { NewsHero } from "@/features/bulletin/components/NewsHero";
import { getBulletinPageData } from "@/features/bulletin/action/queries";
import AddNewsButton from "@/features/bulletin/components/AddNewsButton";
import NewsListing from "@/features/bulletin/components/NewsListing";
import { PageContainer, PageHeader, PageSection } from "@/components/layouts/PageLayout";

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
              actions={<AddNewsButton contentTypes={contentTypes} />}
            />
          </div>

          <NewsListing news={news} contentTypes={contentTypes} />
        </div>
      </PageContainer>
    </PageSection>
  );
}
