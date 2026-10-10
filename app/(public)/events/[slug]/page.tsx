import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  FileText,
  LogIn,
  LogOut,
  MapPin,
  Pencil,
  User,
  Users,
  ChevronLeft,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GetEventBySlug } from "@/features/events/action/queries";
import { GetEventAttendance } from "@/features/events/action/queries";
import { GetEvents } from "@/features/events/action/queries";
import EventImage from "@/features/events/components/EventImage";
import LiveActivityFeed from "@/features/events/components/LiveActivityFeed";
import {
  formatDateShort,
  formatFullDate,
  formatRange,
} from "@/utils/formatters";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/utils/constants/roles";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;

  const [eventResult, attendance, eventsResult, viewerRoleId] = await Promise.all([
    GetEventBySlug(slug),
    (async () => {
      const eventRes = await GetEventBySlug(slug);
      if (eventRes.success && eventRes.data) {
        return GetEventAttendance(eventRes.data.id);
      }
      return { present: 0, departed: 0, total: 0, recent: [] };
    })(),
    GetEvents(),
    (async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", user.id)
        .single();
      return profile?.role_id ?? null;
    })(),
  ]);

  const isStudent = viewerRoleId === ROLES.STUDENT;

  if (!eventResult.success || !eventResult.data) {
    notFound();
  }

  const event = eventResult.data;
  const relatedEvents = eventsResult.success
    ? eventsResult.data
        .filter((e) => e.id !== event.id && e.category_id === event.category_id)
        .slice(0, 3)
    : [];

  const present = attendance.present;
  const total = present + attendance.departed;

  return (
    <div className="flex flex-col py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Event Hero */}
        <div className="relative rounded-xl overflow-hidden">
          <EventImage
            event={event}
            className="aspect-[21/9] w-full"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium uppercase tracking-[0.1em]">
              <span className="rounded bg-red-500 px-2.5 py-1 text-[11px]">
                {event.organizer ?? "College of Computer Studies"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">
                {event.category?.label ?? "Campus Event"}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-bold leading-tight">
              {event.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-200">
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
                <div className="prose prose-slate max-w-none text-slate-600">
                  {event.content ? (
                    <div dangerouslySetInnerHTML={{ __html: event.content }} />
                  ) : event.description ? (
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  ) : (
                    <p className="text-slate-400">No description available.</p>
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
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Organizer
                    </dt>
                    <dd className="mt-1 text-slate-900">
                      {event.organizer ?? "CIT"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Category
                    </dt>
                    <dd className="mt-1">
                      <Badge
                        variant="outline"
                        className={`max-w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          event.category?.color
                            ? `border-transparent bg-[${event.category.color}]/10 text-[${event.category.color}]`
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {event.category?.label ?? "Campus Event"}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Date & Time
                    </dt>
                    <dd className="mt-1 text-slate-900">
                      {formatFullDate(event.start_date, event.end_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Location
                    </dt>
                    <dd className="mt-1 text-slate-900">
                      {event.location ?? "CIT Campus"}
                    </dd>
                  </div>
                  {event.capacity_total && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                        Capacity
                      </dt>
                      <dd className="mt-1 text-slate-900">
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
                <h2 className="font-serif text-2xl font-semibold text-slate-900">
                  Related Events
                </h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedEvents.map((relatedEvent) => (
                    <Link
                      key={relatedEvent.id}
                      href={`/events/${relatedEvent.slug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <EventImage
                        event={relatedEvent}
                        className="aspect-[16/9]"
                      />
                      <div className="flex flex-1 flex-col p-5">
                        <Badge
                          variant="outline"
                          className={`max-w-fit mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            relatedEvent.category?.color
                              ? `border-transparent bg-[${relatedEvent.category.color}]/10 text-[${relatedEvent.category.color}]`
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {relatedEvent.category?.label ?? "Event"}
                        </Badge>
                        <h3 className="font-bold text-slate-900 group-hover:text-[#8B1A1A] transition-colors">
                          {relatedEvent.title}
                        </h3>
                        <p className="mt-1.5 flex-1 text-sm text-slate-500 line-clamp-2">
                          {relatedEvent.description ?? "View event details"}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <Users className="h-5 w-5 text-[#8B1A1A]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Live Attendance
                      </p>
                      <p className="text-xs text-slate-500">
                        Real-time RFID check-in
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Online
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Current count */}
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Current live presence
                    </p>
                    <p className="truncate text-sm font-medium text-slate-700">
                      {event.location ?? "CIT Main Auditorium"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-3xl font-bold text-slate-900">
                      {present}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-green-600">
                      Active inside
                    </p>
                  </div>
                </div>

                {/* Check-in buttons — hidden for students, who cannot operate the gate terminals */}
                {!isStudent && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 gap-1.5 bg-[#8B1A1A] text-xs font-semibold hover:bg-[#6B1515]"
                      asChild
                    >
                      <Link href={`/events/${event.id}/login`}>
                        <LogIn className="h-3.5 w-3.5" />
                        Check In
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 gap-1.5 bg-white text-xs font-semibold"
                      asChild
                    >
                      <Link href={`/events/${event.id}/logout`}>
                        <LogOut className="h-3.5 w-3.5" />
                        Check Out
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Present", value: String(present), accent: false },
                    {
                      label: "Departed",
                      value: String(attendance.departed),
                      accent: false,
                    },
                    { label: "Total Pass", value: String(total), accent: true },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-md border border-slate-200 bg-white px-2 py-2 text-center"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {stat.label}
                      </p>
                      <p
                        className={`mt-0.5 text-sm font-bold ${
                          stat.accent ? "text-[#8B1A1A]" : "text-slate-800"
                        }`}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Live Activity Feed */}
                <div className="border-t border-slate-100 pt-3">
                  <LiveActivityFeed
                    eventId={event.id}
                    initialRecent={attendance.recent}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-3 sticky top-24 self-start">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 flex-1 bg-white text-xs font-semibold"
                asChild
              >
                <Link href={`/events/${event.slug}`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Event
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 flex-1 bg-white text-xs font-semibold"
              >
                <FileText className="h-3.5 w-3.5" />
                View Roster ({present})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 bg-white text-xs font-semibold"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
