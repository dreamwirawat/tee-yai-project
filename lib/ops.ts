import { addDays, daysBetween, parseISODate, toISODate } from "@/lib/date";
import {
  ALL,
  byBranch,
  byHour,
  byPackage,
  byPayment,
  byPromo,
  formatBaht,
  monthLabel,
  type Kpis,
  type Transaction,
} from "@/lib/transactions";

export type DateRange = { from: string; to: string };
export type Bounds = { min: string; max: string };

export function dataBounds(rows: Transaction[]): Bounds {
  let min = "9999-99-99";
  let max = "";
  for (const r of rows) {
    const d = r.ts.slice(0, 10);
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return { min, max };
}

/** Presets are anchored to the last date in the data (the data is historical). */
export type PresetId = "7d" | "30d" | "month" | "90d" | "all";

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: "7d", label: "7 วันล่าสุด" },
  { id: "30d", label: "30 วันล่าสุด" },
  { id: "month", label: "เดือนล่าสุด" },
  { id: "90d", label: "90 วันล่าสุด" },
  { id: "all", label: "ทั้งหมด" },
];

export const DEFAULT_PRESET: PresetId = "month";

export function presetRange(id: PresetId, b: Bounds): DateRange {
  const clamp = (d: string) => (d < b.min ? b.min : d);
  switch (id) {
    case "7d":
      return { from: clamp(addDays(b.max, -6)), to: b.max };
    case "30d":
      return { from: clamp(addDays(b.max, -29)), to: b.max };
    case "90d":
      return { from: clamp(addDays(b.max, -89)), to: b.max };
    case "month":
      return { from: clamp(`${b.max.slice(0, 7)}-01`), to: b.max };
    case "all":
      return { from: b.min, to: b.max };
  }
}

export function matchPreset(r: DateRange, b: Bounds): PresetId | null {
  return PRESETS.find((p) => {
    const pr = presetRange(p.id, b);
    return pr.from === r.from && pr.to === r.to;
  })?.id ?? null;
}

/** Same-length window immediately before `r`. */
export function previousRange(r: DateRange): DateRange {
  const len = daysBetween(r.from, r.to);
  return { from: addDays(r.from, -len), to: addDays(r.from, -1) };
}

/** Clamp/validate a user-supplied range (e.g. from the URL). */
export function sanitizeRange(from: string | null, to: string | null, b: Bounds, fallback: DateRange): DateRange {
  const f = parseISODate(from);
  const t = parseISODate(to);
  if (!f || !t) return fallback;
  let a = toISODate(f);
  let z = toISODate(t);
  if (a > z) [a, z] = [z, a];
  if (a < b.min) a = b.min;
  if (z > b.max) z = b.max;
  return a > z ? fallback : { from: a, to: z };
}

export function inRange(rows: Transaction[], r: DateRange, branch = ALL): Transaction[] {
  return rows.filter((x) => {
    const d = x.ts.slice(0, 10);
    return d >= r.from && d <= r.to && (branch === ALL || x.branch === branch);
  });
}

/** % change, or null when there is no baseline. */
export function pctChange(cur: number, prev: number): number | null {
  if (!prev) return null;
  return ((cur - prev) / prev) * 100;
}

export type MatrixRow = { branch: string; cells: number[]; total: number; change: number | null };

/** Sales per branch per month (+ last-vs-previous month change). */
export function branchMonthMatrix(rows: Transaction[]): { months: string[]; labels: string[]; rows: MatrixRow[] } {
  const months = [...new Set(rows.map((r) => r.ts.slice(0, 7)))].sort();
  const idx = new Map(months.map((m, i) => [m, i]));
  const map = new Map<string, number[]>();
  for (const r of rows) {
    const cells = map.get(r.branch) ?? Array<number>(months.length).fill(0);
    cells[idx.get(r.ts.slice(0, 7))!] += r.net;
    map.set(r.branch, cells);
  }
  const out = [...map.entries()].map(([branch, cells]) => {
    const n = cells.length;
    return {
      branch,
      cells,
      total: cells.reduce((a, b) => a + b, 0),
      change: n >= 2 ? pctChange(cells[n - 1], cells[n - 2]) : null,
    };
  });
  out.sort((a, b) => b.total - a.total);
  return { months, labels: months.map(monthLabel), rows: out };
}

export type Insight = { tone: "good" | "warn" | "info"; title: string; detail: string };

export function buildInsights(rows: Transaction[], k: Kpis, prev: Kpis | null, branch: string): Insight[] {
  if (rows.length === 0) return [];
  const out: Insight[] = [];

  if (prev && prev.sales > 0) {
    const ch = pctChange(k.sales, prev.sales) ?? 0;
    out.push({
      tone: ch >= 0 ? "good" : "warn",
      title: `ยอดขาย${ch >= 0 ? "เพิ่มขึ้น" : "ลดลง"} ${Math.abs(ch).toFixed(1)}%`,
      detail: `เทียบช่วงก่อนหน้า (฿${formatBaht(prev.sales)} → ฿${formatBaht(k.sales)})`,
    });
  }

  if (branch === ALL) {
    const br = byBranch(rows);
    const top = br[0];
    const low = br[br.length - 1];
    if (top && low && top.key !== low.key) {
      out.push({
        tone: "info",
        title: `${top.key} ขายดีที่สุด`,
        detail: `${((top.sales / k.sales) * 100).toFixed(0)}% ของยอดขาย • ต่ำสุดคือ${low.key} (฿${formatBaht(low.sales)})`,
      });
    }
  }

  // Busiest 3-hour window (wraps past midnight).
  const hours = byHour(rows).map((h) => h.bills);
  let best = 0;
  for (let h = 1; h < 24; h++) {
    const sum = (i: number) => hours[i] + hours[(i + 1) % 24] + hours[(i + 2) % 24];
    if (sum(h) > sum(best)) best = h;
  }
  const pad = (h: number) => `${String(h % 24).padStart(2, "0")}:00`;
  out.push({
    tone: "info",
    title: `ช่วงพีค ${pad(best)}–${pad(best + 3)}`,
    detail: "ควรจัดพนักงานและเตรียมวัตถุดิบเพิ่มในช่วงนี้",
  });

  const promos = byPromo(rows).filter((p) => p.bills >= 5);
  const base = promos.find((p) => p.key === "ไม่มีโปร");
  const worst = [...promos].filter((p) => p.key !== "ไม่มีโปร").sort((a, b) => a.gpPct - b.gpPct)[0];
  if (worst && base) {
    out.push({
      tone: worst.gpPct < base.gpPct - 1 ? "warn" : "info",
      title: `โปร "${worst.key}" GP ต่ำสุด ${worst.gpPct.toFixed(1)}%`,
      detail: `บิลไม่มีโปร GP ${base.gpPct.toFixed(1)}% • ใช้ ${formatBaht(worst.bills)} บิล`,
    });
  }

  if (k.discount > 0) {
    const promoRows = byPromo(rows).filter((x) => x.discount > 0).sort((a, b) => b.discount - a.discount);
    const top = promoRows[0];
    out.push({
      tone: "info",
      title: `ให้ส่วนลดไป ฿${formatBaht(k.discount)}`,
      detail: `${((k.discount / k.gross) * 100).toFixed(1)}% ของยอดก่อนลด${top ? ` • มากสุด: ${top.key} ฿${formatBaht(top.discount)}` : ""}`,
    });
  }

  const misuse = rows.filter((r) => r.promo === "มา 4 จ่าย 3" && r.guests < 4).length;
  if (misuse > 0) {
    out.push({
      tone: "warn",
      title: `${formatBaht(misuse)} บิลติดโปร "มา 4 จ่าย 3" แต่มาไม่ถึง 4 คน`,
      detail: "ไม่ได้ส่วนลดจริง อาจกดโปรผิดที่ POS ควรตรวจสอบกับสาขา",
    });
  }

  const pkgs = byPackage(rows);
  const plus = pkgs.find((p) => p.key.includes("พลัส"));
  if (plus) {
    out.push({
      tone: "info",
      title: `แพ็กเกจพลัส ${((plus.bills / k.bills) * 100).toFixed(0)}% ของบิล`,
      detail: `คิดเป็น ${((plus.sales / k.sales) * 100).toFixed(0)}% ของยอดขาย • โอกาสอัปเซลล์`,
    });
  }

  const pay = byPayment(rows)[0];
  if (pay) {
    out.push({
      tone: "info",
      title: `ลูกค้าจ่ายด้วย${pay.key}มากสุด`,
      detail: `${((pay.bills / k.bills) * 100).toFixed(0)}% ของบิล`,
    });
  }

  return out;
}
