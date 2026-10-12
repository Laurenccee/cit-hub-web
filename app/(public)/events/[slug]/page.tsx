import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, MapPin, User, Users, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GetEventBySlug,
  GetEventAttendance,
  GetEvents,
} from "@/features/events/action/queries";
import EventImage from "@/features/events/components/EventImage";
import LiveActivityFeed from "@/features/events/components/LiveActivityFeed";
import { EventAttendanceStats } from "@/features/events/components/EventAttendanceStats";
import { EventCheckInButtons } from "@/features/events/components/EventCheckInButtons";
import { formatDateShort, formatFullDate, formatRange } from "@/utils/formatters";
import { getViewerRoleId } from "@/actions";
import { ROLES } from "@/utils/constants/roles";
import { PageContainer, PageSection } from "@/components/layouts/PageLayout";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Category chips carry an author-defined hex from the DB, so the tint is applied inline. */
function CategoryBadge({ color, label }: { color?: string | null; label: string }) {
  return (
    <Badge
      variant="outline"
      className="max-w-fit rounded-full px-2.5 py-1 text-micro font-semibold"
      style={
        color
          ? {
              color,
              borderColor: "transparent",
              backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
            }
          : undefined
      }
    >
      {label}
    </Badge>
  );
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

  const [attendance, eventsResult, viewerRoleId] = await Promise.all([
    GetEventAttendance(event.id),
    GetEvents(),
    getViewerRoleId(),
  ]);

  const isStudent = viewerRoleId === ROLES.STUDENT;
  const relatedEvents = eventsResult.success
    ? eventsResult.data
        .filter((e) => e.id !== event.id && e.category_id === event.category_id)
        .slice(0, 3)
    : [];

  const present = attendance.present;
  const total = present + attendance.departed;

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

        {/* Event Hero */}
        <div className="relative overflow-hidden rounded-xl">
          <EventImage
            event={event}
            className="aspect-[21/9] w-full"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium uppercase tracking-[0.1em]">
              <span className="rounded bg-primary px-2.5 py-1 text-micro">
                {event.organizer ?? "College of Computer Studies"}
              </span>
              <span className="text-white/50">•</span>
              <span className="text-white/70">
                {event.category?.label ?? "Campus Event"}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-5xl">
              {event.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.location ?? "CIT Campus"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatRange(event.start_date, event.end_date)} PST
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Host: {event.host ?? "TBA"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main content */}
          <div className="flex flex-col gap-6">
            {/* Description & Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About this Event</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="max-w-none text-sm leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-6 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mt-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
                  {event.content ? (
                    <div dangerouslySetInnerHTML={{ __html: event.content }} />
                  ) : event.description ? (
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  ) : (
                    <p className="text-muted-foreground/70">No description available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-micro font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Organizer
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {event.organizer ?? "CIT"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-micro font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Category
                    </dt>
                    <dd className="mt-1">
                      <CategoryBadge
                        color={event.category?.color}
                        label={event.category?.label ?? "Campus Event"}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-micro font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Date &amp; Time
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {formatFullDate(event.start_date, event.end_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-micro font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Location
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {event.location ?? "CIT Campus"}
                    </dd>
                  </div>
                  {event.capacity_total && (
                    <div className="sm:col-span-2">
                      <dt className="text-micro font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Capacity
                      </dt>
                      <dd className="mt-1 text-foreground">
                        {event.capacity_filled ?? 0} / {event.capacity_total}{" "}
                        {event.capacity_unit ?? "spots"}
                        {event.capacity_label && ` (${event.capacity_label})`}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  Related Events
                </h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedEvents.map((relatedEvent) => (
                    <Link
                      key={relatedEvent.id}
                      href={`/events/${relatedEvent.slug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                    >
                      <EventImage event={relatedEvent} className="aspect-[16/9]" />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-2">
                          <CategoryBadge
                            color={relatedEvent.category?.color}
                            label={relatedEvent.category?.label ?? "Event"}
                          />
                        </div>
                        <h3 className="font-bold text-foreground transition-colors group-hover:text-primary">
                          {relatedEvent.title}
                        </h3>
                        <p className="mt-1.5 flex-1 text-sm text-muted-foreground line-clamp-2">
                          {relatedEvent.description ?? "View event details"}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDateShort(relatedEvent.start_date)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {relatedEvent.location}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: Live Attendance Rail */}
          <div className="flex flex-col gap-6">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Live Attendance</p>
                      <p className="text-xs text-muted-foreground">
                        Real-time RFID check-in
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-1.5 py-0.5 text-micro font-bold uppercase tracking-wide text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Online
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Current count */}
                <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <p className="text-micro font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Current live presence
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {event.location ?? "CIT Main Auditorium"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-3xl font-bold text-foreground">
                      {present}
                    </p>
                    <p className="text-micro font-bold uppercase tracking-wide text-success">
                      Active inside
                    </p>
                  </div>
                </div>

                {/* Check-in buttons — hidden for students, who cannot operate the gate terminals */}
                {!isStudent && <EventCheckInButtons eventId={event.id} />}

                {/* Stats */}
                <EventAttendanceStats
                  present={present}
                  departed={attendance.departed}
                  total={total}
                />

                {/* Live Activity Feed */}
                <div className="border-t pt-3">
                  <LiveActivityFeed
                    eventId={event.id}
                    initialRecent={attendance.recent}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </PageSection>
  );
}
