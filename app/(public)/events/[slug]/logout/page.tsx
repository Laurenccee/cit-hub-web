import { notFound } from "next/navigation";
import {
  GetDeskCheckins,
  GetEventAttendance,
  GetEventByIdOrSlug,
} from "@/features/events/action/queries";
import GateTerminal from "@/features/events/components/GateTerminal";

interface GatePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventLogoutPage({ params }: GatePageProps) {
  const { slug } = await params;
  const { data: event } = await GetEventByIdOrSlug(slug);
  if (!event) notFound();

  const [{ data: checkins }, attendance] = await Promise.all([
    GetDeskCheckins(event.id, 50),
    GetEventAttendance(event.id),
  ]);

  return (
    <section
      className="flex flex-col py-8"
      style={{
        backgroundColor: "#fafafa",
        backgroundImage: "radial-gradient(#e0e0e0 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <GateTerminal
          event={event}
          mode="out"
          initialCheckins={checkins}
          initialAttendance={attendance}
        />
      </div>
    </section>
  );
}
