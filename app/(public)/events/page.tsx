import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventHero } from "@/features/events/components/EventHero";
import { EventsListing } from "@/features/events/components/EventsListing";
import { getEventsPageData } from "@/features/events/action/queries";
import { EventCategory, EventItem } from "@/features/events/types";

const demoCategories: EventCategory[] = [
  { id: "academic", label: "Academic" },
  { id: "student-life", label: "Student Life" },
];

function demoEvent(
  overrides: Partial<EventItem> & Pick<EventItem, "id" | "title" | "slug">,
): EventItem {
  return {
    description: "",
    is_published: true,
    is_featured: false,
    start_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const demoFeaturedEvent: EventItem = demoEvent({
  id: "demo-featured-symposium",
  title: "CIT Annual Tech Symposium & Hackathon 2025",
  slug: "cit-annual-tech-symposium-hackathon-2025",
  description:
    "Join industry leaders, academic researchers, and student innovators exploring breakthrough AI agents, smart city infrastructures, and hands-on robotics workshops.",
  organizer: "College of Computer Studies",
  host: "Dr. Alicia Ramos & CIT Council",
  location: "Main Auditorium & Hybrid Stream",
  start_date: "2026-10-01T09:00:00+08:00",
  end_date: "2026-10-01T17:00:00+08:00",
  is_featured: true,
  capacity_filled: 342,
  capacity_total: 400,
  cover: "symposium",
  category: { label: "Departmental Keynote" },
});

const demoEvents: EventItem[] = [
  demoEvent({
    id: "demo-robotics-ai",
    title: "Robotics & AI Innovation Workshop",
    slug: "robotics-ai-innovation-workshop",
    description:
      "Hands-on machine vision setup, micro-controller wiring, and building lightweight LLM agents for edge computing devices.",
    location: "Maker Space Lab 304",
    start_date: "2026-10-28T13:30:00+08:00",
    end_date: "2026-10-28T16:30:00+08:00",
    capacity_label: "Seats Filled",
    capacity_filled: 118,
    capacity_total: 140,
    capacity_unit: "spots",
    is_rsvp_confirmed: true,
    cover: "robotics",
    category: { label: "Academic Workshop" },
  }),
  demoEvent({
    id: "demo-career-expo",
    title: "Midterm Career Expo & Resume Clinic",
    slug: "midterm-career-expo-resume-clinic",
    description:
      "Meet 45+ hiring corporate partners in engineering, software development, accounting, and business intelligence with mock interviews.",
    location: "University Gymnasium",
    start_date: "2026-11-02T10:00:00+08:00",
    end_date: "2026-11-02T16:00:00+08:00",
    capacity_label: "Pre-Registrations",
    capacity_filled: 420,
    capacity_total: 600,
    capacity_unit: "spots",
    cover: "expo",
    category: { label: "Career Fair" },
  }),
  demoEvent({
    id: "demo-pioneers-summit",
    title: "CIT Pioneers Leadership Summit",
    slug: "cit-pioneers-leadership-summit",
    description:
      "Annual strategic orientation and leadership development conference for recognized student council officers and club heads.",
    location: "Multipurpose Hall A & B",
    start_date: "2026-11-10T08:30:00+08:00",
    end_date: "2026-11-10T15:00:00+08:00",
    capacity_label: "Delegates",
    capacity_filled: 195,
    capacity_total: 200,
    cover: "pioneers",
    category: { label: "Pioneers Assembly" },
  }),
  demoEvent({
    id: "demo-ctf",
    title: "Cybersecurity Defense Challenge (CTF)",
    slug: "cybersecurity-defense-challenge-ctf",
    description:
      "Inter-collegiate Capture the Flag covering web exploitation, reverse engineering, cryptography, and network forensics.",
    location: "Engineering Hall 101",
    start_date: "2026-11-15T13:00:00+08:00",
    end_date: "2026-11-15T19:00:00+08:00",
    capacity_label: "Teams Enrolled",
    capacity_filled: 28,
    capacity_total: 32,
    capacity_unit: "teams",
    cover: "ctf",
    category: { label: "Competition" },
  }),
  demoEvent({
    id: "demo-symphony-gala",
    title: "University Symphony Gala & Art Exhibit",
    slug: "university-symphony-gala-art-exhibit",
    description:
      "An evening showcasing original contemporary and classical orchestral compositions by CIT student musicians and visual artists.",
    location: "Main Performing Arts Theater",
    start_date: "2026-11-22T18:00:00+08:00",
    end_date: "2026-11-22T21:30:00+08:00",
    capacity_label: "Seating Reservation",
    capacity_filled: 230,
    capacity_total: 350,
    capacity_unit: "spots",
    cover: "gala",
    category: { label: "Cultural & Arts" },
  }),
  demoEvent({
    id: "demo-clean-energy",
    title: "Clean Energy & Solar Grid Systems",
    slug: "clean-energy-solar-grid-systems",
    description:
      "Department of Electrical Engineering presents findings on sustainable microgrids and decentralized solar battery storage.",
    location: "Science Complex Aud. 2",
    start_date: "2026-11-29T14:00:00+08:00",
    end_date: "2026-11-29T17:00:00+08:00",
    capacity_label: "Auditorium Capacity",
    capacity_filled: 80,
    capacity_total: 120,
    capacity_unit: "spots",
    cover: "energy",
    category: { label: "Research Colloquium" },
  }),
];

export default async function EventsPage() {
  const { categories, featuredEvents, events } = await getEventsPageData();

  const heroEvent = featuredEvents[0] ?? events[0] ?? demoFeaturedEvent;
  const listingEvents = events.length > 0 ? events : demoEvents;
  const listingCategories = categories.length > 0 ? categories : demoCategories;

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
        <EventHero event={heroEvent} />

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
            <Button
              type="button"
              className="h-9 shrink-0 gap-1.5 bg-[#8B1A1A] text-xs font-semibold hover:bg-[#6B1515]"
            >
              <Plus className="h-4 w-4" />
              Create New Event
            </Button>
          </div>

          <EventsListing
            events={listingEvents}
            categories={listingCategories}
          />
        </div>
      </div>
    </section>
  );
}
