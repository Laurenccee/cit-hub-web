import EventHero from "@/features/events/components/EventHero";
import EventsListing from "@/features/events/components/EventsListing";
import CreateEventButton from "@/features/events/components/CreateEventButton";
import {
  getEventsPageData,
  GetEventAttendance,
} from "@/features/events/action/queries";
import { EventAttendance } from "@/features/events/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { PageContainer, PageHeader, PageSection } from "@/components/layouts/PageLayout";

export default async function EventsPage() {
  const { featuredEvent, events } = await getEventsPageData();

  const heroEvent = featuredEvent ?? events[0];
  const heroAttendance: EventAttendance = heroEvent
    ? await GetEventAttendance(heroEvent.id)
    : { present: 0, departed: 0, total: 0, recent: [] };

  return (
    <PageSection>
      <PageContainer className="gap-8">
        {heroEvent ? (
          <EventHero event={heroEvent} attendance={heroAttendance} />
        ) : (
          <Card className="border-dashed bg-card/80 py-12 text-center">
            <CardContent className="flex flex-col items-center gap-3">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold text-foreground">No events yet</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                There are no published events at the moment. Check back soon or
                create a new event to get started.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-5">
          <PageHeader
            title="Campus Events"
            description="Stay updated with the latest events, workshops, and activities across the CIT community."
            actions={<CreateEventButton />}
          />

          <EventsListing events={events} />
        </div>
      </PageContainer>
    </PageSection>
  );
}
