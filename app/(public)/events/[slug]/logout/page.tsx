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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
            <span className="text-[#8B1A1A]">Entry Desk</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-500">RFID Log Out</span>
          </p>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Event Log Out
          </h1>
        </div>

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
