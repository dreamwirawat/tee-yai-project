import raw from "@/data/transactions.json";

export type Transaction = {
  id: string;
  /** "YYYY-MM-DD HH:mm" (local shop time) */
  ts: string;
  branch: string;
  pkg: string;
  guests: number;
  promo: string;
  pay: string;
  net: number;
  foodCost: number;
  bevCost: number;
  cost: number;
  gp: number;
  gpPct: number;
};

export const ALL = "all";

export function loadTransactions(): Transaction[] {
  return raw as Transaction[];
}

export function uniqueSorted(rows: Transaction[], key: keyof Transaction) {
  return [...new Set(rows.map((r) => String(r[key])))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );
}

/** List price per guest, parsed from the package name ("พลัส 359 NET" → 359). */
export function packagePrice(pkg: string): number {
  const m = pkg.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

/**
 * Promo discount in baht = list price × guests − net.
 * Verified against all 1,000 bills: never negative, 0 for "ไม่มีโปร".
 */
export const discountOf = (r: Transaction) => Math.max(0, r.guests * packagePrice(r.pkg) - r.net);

const pct = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 10000) / 100;

export type Kpis = {
  sales: number;
  bills: number;
  guests: number;
  avgBill: number;
  avgPerHead: number;
  cost: number;
  foodCost: number;
  bevCost: number;
  gp: number;
  gpPct: number;
  /** Sales before promotions (list price × guests). */
  gross: number;
  discount: number;
};

export function computeKpis(rows: Transaction[]): Kpis {
  const sum = (k: "net" | "guests" | "cost" | "foodCost" | "bevCost" | "gp") =>
    rows.reduce((a, r) => a + r[k], 0);
  const sales = sum("net");
  const guests = sum("guests");
  const gp = sum("gp");
  const discount = rows.reduce((a, r) => a + discountOf(r), 0);
  return {
    sales,
    bills: rows.length,
    guests,
    avgBill: rows.length ? Math.round(sales / rows.length) : 0,
    avgPerHead: guests ? Math.round(sales / guests) : 0,
    cost: sum("cost"),
    foodCost: sum("foodCost"),
    bevCost: sum("bevCost"),
    gp,
    gpPct: pct(gp, sales),
    gross: sales + discount,
    discount,
  };
}

export type GroupRow = {
  key: string;
  bills: number;
  guests: number;
  sales: number;
  gp: number;
  gpPct: number;
  avgBill: number;
  discount: number;
};

export const EMPTY_GROUP: Omit<GroupRow, "key"> = {
  bills: 0, guests: 0, sales: 0, gp: 0, gpPct: 0, avgBill: 0, discount: 0,
};

export function groupBy(
  rows: Transaction[],
  keyFn: (r: Transaction) => string,
): GroupRow[] {
  const map = new Map<string, GroupRow>();
  for (const r of rows) {
    const k = keyFn(r);
    const g =
      map.get(k) ??
      ({ key: k, ...EMPTY_GROUP } satisfies GroupRow);
    g.bills += 1;
    g.guests += r.guests;
    g.sales += r.net;
    g.gp += r.gp;
    g.discount += discountOf(r);
    map.set(k, g);
  }
  return [...map.values()].map((g) => ({
    ...g,
    gpPct: pct(g.gp, g.sales),
    avgBill: g.bills ? Math.round(g.sales / g.bills) : 0,
  }));
}

export const byMonth = (rows: Transaction[]) =>
  groupBy(rows, (r) => r.ts.slice(0, 7)).sort((a, b) =>
    a.key.localeCompare(b.key),
  );

export const byDay = (rows: Transaction[]) =>
  groupBy(rows, (r) => r.ts.slice(0, 10)).sort((a, b) => a.key.localeCompare(b.key));

export const byBranch = (rows: Transaction[]) =>
  groupBy(rows, (r) => r.branch).sort((a, b) => b.sales - a.sales);

export const byPackage = (rows: Transaction[]) =>
  groupBy(rows, (r) => r.pkg).sort((a, b) => b.sales - a.sales);

export const byPromo = (rows: Transaction[]) =>
  groupBy(rows, (r) => r.promo).sort((a, b) => b.bills - a.bills);

export const byPayment = (rows: Transaction[]) =>
  groupBy(rows, (r) => r.pay).sort((a, b) => b.sales - a.sales);

export const byHour = (rows: Transaction[]) => {
  const g = new Map(groupBy(rows, (r) => r.ts.slice(11, 13)).map((x) => [x.key, x]));
  return Array.from({ length: 24 }, (_, h) => {
    const key = String(h).padStart(2, "0");
    return { hour: `${key}:00`, bills: g.get(key)?.bills ?? 0, sales: g.get(key)?.sales ?? 0 };
  });
};

export const DAY_LABELS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

/** Day of week (0 = Sunday) for a "YYYY-MM-DD ..." timestamp, timezone-independent. */
export function dayOfWeek(ts: string): number {
  const [y, m, d] = ts.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** matrix[day][hour] = number of bills */
export function heatmap(rows: Transaction[]): number[][] {
  const m = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const r of rows) m[dayOfWeek(r.ts)][Number(r.ts.slice(11, 13))] += 1;
  return m;
}

export const formatBaht = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);

export const formatCompact = (n: number) =>
  new Intl.NumberFormat("th-TH", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const MONTH_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export const monthLabel = (ym: string) => MONTH_TH[Number(ym.slice(5, 7)) - 1] ?? ym;
