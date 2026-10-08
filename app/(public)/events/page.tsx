import EventHero from "@/features/events/components/EventHero";
import EventsListing from "@/features/events/components/EventsListing";
import CreateEventButton from "@/features/events/components/CreateEventButton";
import {
  getEventsPageData,
  GetEventAttendance,
} from "@/features/events/action/queries";
import {
  EventAttendance,
} from "@/features/events/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default async function EventsPage() {
  const { categories, featuredEvent, events } = await getEventsPageData();

  const heroEvent = featuredEvent ?? events[0];
  const heroAttendance: EventAttendance = heroEvent
    ? await GetEventAttendance(heroEvent.id)
    : { present: 0, departed: 0, total: 0, recent: [] };

  return (
    <section
      className="flex flex-col py-8"
      style={{
        backgroundColor: "#fafafa",
        backgroundImage: "radial-gradient(#e0e0e0 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {heroEvent ? (
          <EventHero event={heroEvent} attendance={heroAttendance} />
        ) : (
          <Card className="border-dashed bg-white/80 py-12 text-center">
            <CardContent className="flex flex-col items-center gap-3">
              <Calendar className="h-12 w-12 text-slate-300" />
              <h2 className="text-lg font-semibold text-slate-900">
                No events yet
              </h2>
              <p className="text-sm text-slate-500 max-w-md">
                There are no published events at the moment. Check back soon or
                create a new event to get started.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Campus Events
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Stay updated with the latest events, workshops, and activities
                across the CIT community.
              </p>
            </div>
            <CreateEventButton />
          </div>

          <EventsListing events={events} categories={categories} />
        </div>
      </div>
    </section>
  );
}
