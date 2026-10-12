interface EventAttendanceStatsProps {
  present: number;
  departed: number;
  total: number;
}

/**
 * Three-up attendance summary used across event surfaces. Keeping the labels
 * and accent styling here keeps the public page and the live rail identical.
 */
export function EventAttendanceStats({
  present,
  departed,
  total,
}: EventAttendanceStatsProps) {
  const stats = [
    { label: "Present", value: present, accent: false },
    { label: "Departed", value: departed, accent: false },
    { label: "Total Pass", value: total, accent: true },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-md border border-border bg-card px-2 py-2 text-center"
        >
          <p className="text-micro font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {stat.label}
          </p>
          <p
            className={`mt-0.5 text-sm font-bold ${
              stat.accent ? "text-primary" : "text-foreground"
            }`}
          >
            {String(stat.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
