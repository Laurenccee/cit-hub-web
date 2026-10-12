import { notFound } from "next/navigation";
import {
  GetDeskCheckins,
  GetEventAttendance,
  GetEventByIdOrSlug,
} from "../action/queries";
import GateTerminal from "./GateTerminal";
import { PageContainer, PageSection } from "@/components/layouts/PageLayout";

interface EventGatePageProps {
  params: Promise<{ slug: string }>;
  /** Which tap the terminal records: entry or exit. */
  mode: "in" | "out";
}

/**
 * Shared shell for the event gate terminals. The check-in and check-out routes
 * load the same event and attendance payload and differ only in the terminal
 * mode, so the page body lives here.
 */
export default async function EventGatePage({
  params,
  mode,
}: EventGatePageProps) {
  const { slug } = await params;
  const { data: event } = await GetEventByIdOrSlug(slug);
  if (!event) notFound();

  const [{ data: checkins }, attendance] = await Promise.all([
    GetDeskCheckins(event.id, 50),
    GetEventAttendance(event.id),
  ]);

  return (
    <PageSection>
      <PageContainer className="gap-6">
        <GateTerminal
          event={event}
          mode={mode}
          initialCheckins={checkins}
          initialAttendance={attendance}
        />
      </PageContainer>
    </PageSection>
  );
}
