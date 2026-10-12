import EventGatePage from "@/features/events/components/EventGatePage";

interface EventLogoutPageProps {
  params: Promise<{ slug: string }>;
}

export default function EventLogoutPage({ params }: EventLogoutPageProps) {
  return <EventGatePage params={params} mode="out" />;
}
