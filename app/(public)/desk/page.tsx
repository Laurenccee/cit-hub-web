import { Nfc } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  GetDeskCheckins,
  GetDeskEvents,
  GetEventAttendance,
  isEventLive,
} from "@/features/events/action/queries";
import { DeskTerminal } from "@/features/events/components/DeskTerminal";

interface DeskPageProps {
  searchParams: Promise<{ event?: string }>;
}

export default async function DeskPage({ searchParams }: DeskPageProps) {
  const { event: eventSlug } = await searchParams;
  const { data: events } = await GetDeskEvents();

  const selected =
    events.find((e) => e.slug === eventSlug) ??
    events.find((e) => isEventLive(e)) ??
    events[0] ??
    null;

  const [{ data: checkins }, attendance] = selected
    ? await Promise.all([
        GetDeskCheckins(selected.id, 50),
        GetEventAttendance(selected.id),
      ])
    : [{ data: [] }, { present: 0, departed: 0, total: 0, recent: [] }];

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
            <span className="text-slate-500">RFID Check-in & Check-out</span>
          </p>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            RFID Scan Log
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Tap a card on the reader (or type the UID) to log an entry or
            exit. Every tap is recorded against the selected event below.
          </p>
        </div>

        {events.length === 0 || !selected ? (
          <Card className="border-dashed bg-white/80 py-12 text-center">
            <CardContent className="flex flex-col items-center gap-2">
              <Nfc className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                No live or upcoming events
              </p>
              <p className="text-xs text-slate-400">
                Publish an event before opening the check-in desk.
              </p>
            </CardContent>
          </Card>
        ) : (
          <DeskTerminal
            events={events}
            selectedEvent={selected}
            initialCheckins={checkins}
            initialAttendance={attendance}
          />
        )}
      </div>
    </section>
  );
}
