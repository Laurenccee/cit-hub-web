const phDateFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const shortMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const dayDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";
  return phDateFormatter.format(d);
}

export function formatDayDate(
  date: Date | string,
  type: "long" | "short" | "dd" | "MMM" = "long",
) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  if (type === "dd") {
    return d.getDate().toString().padStart(2, "0");
  }

  if (type === "MMM") {
    return shortMonthFormatter.format(d);
  }

  return dayDateFormatter.format(d);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

function truncateText(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayHours = h % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatRange(start: string, end?: string) {
  const format = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const startLabel = format(start);
  if (!end) return startLabel;
  return `${startLabel} – ${format(end)}`;
}

export function formatFullDate(start: string, end?: string) {
  const dateFmt = new Date(start).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeFmt = formatRange(start, end);
  return `${dateFmt} • ${timeFmt}`;
}

export function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
