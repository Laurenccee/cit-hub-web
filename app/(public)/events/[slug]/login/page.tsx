import EventGatePage from "@/features/events/components/EventGatePage";

interface EventLoginPageProps {
  params: Promise<{ slug: string }>;
}

export default function EventLoginPage({ params }: EventLoginPageProps) {
  return <EventGatePage params={params} mode="in" />;
}
