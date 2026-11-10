import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  GetEventBySlug,
  GetEventAttendance,
  GetRelatedEvents,
} from "@/features/events/action/queries";
import { EventDetailHero } from "@/features/events/components/EventDetailHero";
import { EventAboutCard } from "@/features/events/components/EventAboutCard";
import { EventDetailsCard } from "@/features/events/components/EventDetailsCard";
import { RelatedEvents } from "@/features/events/components/RelatedEvents";
import { LiveAttendanceCard } from "@/features/events/components/LiveAttendanceCard";
import { getViewerRoleId } from "@/actions";
import { ROLES } from "@/utils/constants/roles";
import { PageContainer, PageSection } from "@/components/layouts/PageLayout";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;

  const eventResult = await GetEventBySlug(slug);
  if (!eventResult.success || !eventResult.data) {
    notFound();
  }

  const event = eventResult.data;

  const [attendance, relatedResult, viewerRoleId] = await Promise.all([
    GetEventAttendance(event.id),
    GetRelatedEvents(event),
    getViewerRoleId(),
  ]);

  const isStudent = viewerRoleId === ROLES.STUDENT;
  const relatedEvents = relatedResult.data;

  return (
    <PageSection>
      <PageContainer className="gap-8">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Events
        </Link>

        <EventDetailHero event={event} />

        <div className="grid gap-8 lg:grid-cols-sidebar">
          {/* Main content */}
          <div className="flex flex-col gap-6">
            <EventAboutCard event={event} />
            <EventDetailsCard event={event} />
            <RelatedEvents events={relatedEvents} />
          </div>

          {/* Sidebar: Live Attendance Rail */}
          <div className="flex flex-col gap-6">
            <LiveAttendanceCard
              event={event}
              attendance={attendance}
              isStudent={isStudent}
            />
          </div>
        </div>
      </PageContainer>
    </PageSection>
  );
}
