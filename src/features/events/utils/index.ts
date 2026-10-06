export function isEventLive(
  event: { start_date: string; end_date?: string | null },
  now = new Date(),
) {
  const start = new Date(event.start_date).getTime();
  const end = event.end_date
    ? new Date(event.end_date).getTime()
    : Number.POSITIVE_INFINITY;
  const at = now.getTime();
  return start <= at && at <= end;
}
