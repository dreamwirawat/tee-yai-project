/** "YYYY-MM-DD" in local time (no timezone shift, unlike toISOString). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse "YYYY-MM-DD" as a local date. Returns undefined for empty/invalid input. */
export function parseISODate(s: string | null | undefined): Date | undefined {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) || date.getMonth() !== m - 1 ? undefined : date;
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Inclusive day count between two ISO dates. */
export function daysBetween(from: string, to: string): number {
  const a = parseISODate(from);
  const b = parseISODate(to);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
}

const thaiShort = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "2-digit" });
const thaiLong = new Intl.DateTimeFormat("th-TH", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

/** "1 มิ.ย. 69" (Buddhist era, as Thai users expect). */
export const formatThaiShort = (iso: string) => {
  const d = parseISODate(iso);
  return d ? thaiShort.format(d) : "";
};

/** "จ. 1 มิถุนายน 2569" */
export const formatThaiLong = (d: Date) => thaiLong.format(d);
