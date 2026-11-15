import { dataBounds } from "@/lib/ops";
import {
  byBranch,
  byPackage,
  byPayment,
  byPromo,
  computeKpis,
  loadTransactions,
  packagePrice,
  uniqueSorted,
} from "@/lib/transactions";

/**
 * Everything the storefront states as fact is derived here from the xlsx data
 * (data/transactions.json) — nothing is typed in by hand.
 */
export type CatalogPackage = {
  /** Full name as it appears in the data, e.g. "พลัส 359 NET" — also the booking id */
  key: string;
  /** Short name, e.g. "พลัส" */
  name: string;
  price: number;
  /** % of all bills */
  billShare: number;
  /** average guests per bill */
  avgParty: number;
};

export type CatalogPromo = {
  key: string;
  /** "นักศึกษา" from "นักศึกษา 10%" */
  label: string;
  /** "ลด 10%" when the name carries a percentage, otherwise null */
  deal: string | null;
  bills: number;
};

export type Catalog = {
  packages: CatalogPackage[];
  promos: CatalogPromo[];
  branches: string[];
  payments: string[];
  /** hours of day that appear in the data, "00".."23" */
  hours: string[];
  stats: { guests: number; bills: number; avgPerHead: number; months: number; from: string; to: string };
};

const NO_PROMO = "ไม่มีโปร";

export function getCatalog(): Catalog {
  const rows = loadTransactions();
  const k = computeKpis(rows);
  const bounds = dataBounds(rows);

  const packages = byPackage(rows)
    .map((g) => ({
      key: g.key,
      name: g.key.split(" ")[0],
      price: packagePrice(g.key),
      billShare: Math.round((g.bills / k.bills) * 100),
      avgParty: g.bills ? g.guests / g.bills : 0,
    }))
    .sort((a, b) => a.price - b.price);

  const promos = byPromo(rows)
    .filter((p) => p.key !== NO_PROMO)
    .map((p) => {
      const pct = p.key.match(/(\d+)%/);
      return {
        key: p.key,
        label: p.key.replace(/\s*\d+%\s*$/, ""),
        deal: pct ? `ลด ${pct[1]}%` : null,
        bills: p.bills,
      };
    });

  const months = new Set(rows.map((r) => r.ts.slice(0, 7))).size;

  return {
    packages,
    promos,
    branches: uniqueSorted(rows, "branch"),
    payments: byPayment(rows).map((p) => p.key),
    hours: [...new Set(rows.map((r) => r.ts.slice(11, 13)))].sort(),
    stats: {
      guests: k.guests,
      bills: k.bills,
      avgPerHead: k.avgPerHead,
      months,
      from: bounds.min,
      to: bounds.max,
    },
  };
}

/** Branch list ordered by sales (used where a ranking is wanted). */
export const branchesBySales = () => byBranch(loadTransactions()).map((b) => b.key);
