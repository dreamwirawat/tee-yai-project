"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  ChartPieIcon,
  ClockIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  LightbulbIcon,
  TicketPercentIcon,
  HandCoinsIcon,
  MedalIcon,
  ReceiptIcon,
  RotateCcwIcon,
  StoreIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UsersIcon,
  WalletCardsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillsTable } from "@/components/ops/bills-table";
import { BranchChart, Donut, Heatmap, HourChart, TrendChart } from "@/components/ops/charts";
import { DateRangePicker } from "@/components/ops/date-range-picker";
import { OpsThemeController, OpsThemeToggle } from "@/components/ops/theme";
import { addDays, daysBetween, formatThaiShort } from "@/lib/date";
import {
  DEFAULT_PRESET,
  branchMonthMatrix,
  buildInsights,
  dataBounds,
  inRange,
  pctChange,
  presetRange,
  previousRange,
  sanitizeRange,
  type DateRange,
  type Insight,
} from "@/lib/ops";
import {
  ALL,
  byBranch,
  byDay,
  byHour,
  byMonth,
  byPackage,
  byPayment,
  byPromo,
  EMPTY_GROUP,
  computeKpis,
  formatBaht,
  heatmap,
  uniqueSorted,
  type GroupRow,
  type Transaction,
} from "@/lib/transactions";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "ภาพรวม", icon: LayoutDashboardIcon },
  { id: "branches", label: "สาขา", icon: StoreIcon },
  { id: "mix", label: "แพ็กเกจ/โปร/ชำระเงิน", icon: ChartPieIcon },
  { id: "time", label: "ช่วงเวลา", icon: ClockIcon },
  { id: "bills", label: "รายการบิล", icon: ReceiptTextIcon },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** Filter state lives in the URL so views can be shared and survive refresh. */
function useOpsState(rows: Transaction[]) {
  const sp = useSearchParams();
  const bounds = useMemo(() => dataBounds(rows), [rows]);
  const branches = useMemo(() => uniqueSorted(rows, "branch"), [rows]);
  const fallback = useMemo(() => presetRange(DEFAULT_PRESET, bounds), [bounds]);

  const range = sanitizeRange(sp.get("from"), sp.get("to"), bounds, fallback);
  const rawBranch = sp.get("branch");
  const branch = rawBranch && branches.includes(rawBranch) ? rawBranch : ALL;
  const rawTab = sp.get("tab");
  const tab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "overview";

  const update = useCallback(
    (patch: Partial<{ range: DateRange; branch: string; tab: TabId }>) => {
      const next = new URLSearchParams(window.location.search);
      const setOrDelete = (k: string, v: string, def: string) => (v === def ? next.delete(k) : next.set(k, v));
      if (patch.range) {
        const isDefault = patch.range.from === fallback.from && patch.range.to === fallback.to;
        if (isDefault) {
          next.delete("from");
          next.delete("to");
        } else {
          next.set("from", patch.range.from);
          next.set("to", patch.range.to);
        }
      }
      if (patch.branch !== undefined) setOrDelete("branch", patch.branch, ALL);
      if (patch.tab !== undefined) setOrDelete("tab", patch.tab, "overview");
      const qs = next.toString();
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    },
    [fallback],
  );

  const isDefault = branch === ALL && range.from === fallback.from && range.to === fallback.to;
  return { bounds, branches, range, branch, tab, update, isDefault, fallback };
}

export function OpsDashboard({ rows }: { rows: Transaction[] }) {
  const { bounds, branches, range, branch, tab, update, isDefault, fallback } = useOpsState(rows);

  const prevRange = useMemo(() => previousRange(range), [range]);
  const filtered = useMemo(() => inRange(rows, range, branch), [rows, range, branch]);
  const allBranchesInRange = useMemo(() => inRange(rows, range), [rows, range]);
  const previous = useMemo(() => inRange(rows, prevRange, branch), [rows, prevRange, branch]);

  const stats = useMemo(() => {
    const kpis = computeKpis(filtered);
    const prevKpis = previous.length ? computeKpis(previous) : null;
    const granularity: "day" | "month" = daysBetween(range.from, range.to) <= 62 ? "day" : "month";
    return {
      kpis,
      prevKpis,
      granularity,
      trend: granularity === "day" ? fillDays(byDay(filtered), range) : byMonth(filtered),
      branch: byBranch(filtered),
      branchRank: byBranch(allBranchesInRange),
      pkg: byPackage(filtered),
      promo: byPromo(filtered),
      pay: byPayment(filtered),
      hour: byHour(filtered),
      heat: heatmap(filtered),
      insights: buildInsights(filtered, kpis, prevKpis, branch),
      matrix: branchMonthMatrix(allBranchesInRange),
    };
  }, [filtered, previous, allBranchesInRange, branch, range]);

  const k = stats.kpis;
  const p = stats.prevKpis;
  const rank = branch === ALL ? 0 : stats.branchRank.findIndex((b) => b.key === branch) + 1;
  const branchItems = [{ value: ALL, label: "ทุกสาขา" }, ...branches.map((b) => ({ value: b, label: b }))];

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <OpsThemeController />
      <OpsAppBar />

      <div className="mx-auto w-full max-w-[1320px] flex-1 space-y-5 px-4 py-6 md:px-6">
        {/* Title + filters */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">ภาพรวมยอดขาย</h1>
            <p className="text-sm text-muted-foreground">
              {branch === ALL ? "ทุกสาขา" : `สาขา${branch}`} • {formatThaiShort(range.from)} – {formatThaiShort(range.to)}
              {p ? <> • เทียบกับ {formatThaiShort(prevRange.from)} – {formatThaiShort(prevRange.to)}</> : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              items={branchItems}
              value={branch}
              onValueChange={(v) => update({ branch: v ?? ALL })}
            >
              <SelectTrigger className="h-9 w-40 bg-card" aria-label="เลือกสาขา">
                <StoreIcon className="size-4 text-gold-ink" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branchItems.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker value={range} bounds={bounds} onChange={(r) => update({ range: r })} />
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              disabled={isDefault}
              onClick={() => update({ range: fallback, branch: ALL })}
            >
              <RotateCcwIcon /> รีเซ็ต
            </Button>
          </div>
        </section>

        {/* KPIs */}
        <section aria-label="ตัวชี้วัดหลัก" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icon={<BanknoteIcon />} label="ยอดขายสุทธิ" value={`฿${formatBaht(k.sales)}`} delta={pctChange(k.sales, p?.sales ?? 0)} highlight />
          <Kpi icon={<TrendingUpIcon />} label="กำไรขั้นต้น" value={`฿${formatBaht(k.gp)}`} delta={pctChange(k.gp, p?.gp ?? 0)} sub={`GP ${k.gpPct.toFixed(1)}%`} />
          <Kpi icon={<ReceiptIcon />} label="จำนวนบิล" value={formatBaht(k.bills)} delta={pctChange(k.bills, p?.bills ?? 0)} sub={`เฉลี่ย ฿${formatBaht(k.avgBill)}/บิล`} />
          <Kpi icon={<UsersIcon />} label="จำนวนลูกค้า" value={formatBaht(k.guests)} delta={pctChange(k.guests, p?.guests ?? 0)} sub={`เฉลี่ย ${(k.bills ? k.guests / k.bills : 0).toFixed(1)} ท่าน/บิล`} />
          <Kpi icon={<HandCoinsIcon />} label="ยอดเฉลี่ยต่อท่าน" value={`฿${formatBaht(k.avgPerHead)}`} delta={pctChange(k.avgPerHead, p?.avgPerHead ?? 0)} sub="หลังหักส่วนลดโปรโมชั่น" />
          <Kpi icon={<WalletCardsIcon />} label="ต้นทุนรวม" value={`฿${formatBaht(k.cost)}`} delta={pctChange(k.cost, p?.cost ?? 0)} invert sub={`อาหาร ${share(k.foodCost, k.cost)} • เครื่องดื่ม ${share(k.bevCost, k.cost)}`} />
          <Kpi icon={<TicketPercentIcon />} label="ส่วนลดที่ให้ไป" value={`฿${formatBaht(k.discount)}`} delta={pctChange(k.discount, p?.discount ?? 0)} invert sub={`${k.gross ? ((k.discount / k.gross) * 100).toFixed(1) : 0}% ของยอดก่อนลด`} />
          {branch === ALL ? (
            <Kpi icon={<MedalIcon />} label="สาขาอันดับ 1" value={stats.branch[0]?.key ?? "-"} sub={stats.branch[0] ? `฿${formatBaht(stats.branch[0].sales)}` : undefined} />
          ) : (
            <Kpi icon={<MedalIcon />} label="อันดับยอดขาย" value={rank ? `อันดับ ${rank} จาก ${stats.branchRank.length}` : "-"} sub="เทียบทุกสาขาในช่วงเดียวกัน" />
          )}
        </section>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              ไม่มีบิลในช่วงที่เลือก ลองเปลี่ยนช่วงวันที่หรือสาขา
            </CardContent>
          </Card>
        ) : (
          <Tabs value={tab} onValueChange={(v) => update({ tab: v as TabId })}>
            <div className="-mx-4 overflow-x-auto overflow-y-hidden px-4 py-0.5 md:mx-0 md:px-0">
              <TabsList aria-label="มุมมองข้อมูล" className="h-auto gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
                {TABS.map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className={cn(
                      "h-9 flex-none cursor-pointer gap-1.5 rounded-lg px-3.5 text-muted-foreground",
                      "hover:bg-muted hover:text-foreground",
                      "data-active:bg-cocoa data-active:text-white data-active:shadow-sm",
                      "dark:data-active:border-transparent dark:data-active:bg-gold dark:data-active:text-cocoa",
                    )}
                  >
                    <t.icon />
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-3">
              <InsightsCard insights={stats.insights} />
              <TrendChart data={stats.trend} granularity={stats.granularity} />
              <Donut title="สัดส่วนยอดขายตามแพ็กเกจ" data={stats.pkg} value={(r) => r.sales} unit="บาท" centerLabel="ยอดขาย" />
              <BranchChart data={stats.branchRank} highlight={branch === ALL ? undefined : branch} />
              <Donut title="ช่องทางชำระเงิน" description="ตามยอดขาย" data={stats.pay} value={(r) => r.sales} unit="บาท" centerLabel="ยอดขาย" />
              <Donut title="จำนวนบิลตามโปรโมชั่น" data={stats.promo} value={(r) => r.bills} unit="บิล" centerLabel="บิล" />
            </TabsContent>

            <TabsContent value="branches" className="mt-4 grid gap-4 lg:grid-cols-2">
              <BranchChart data={stats.branchRank} highlight={branch === ALL ? undefined : branch} />
              <SummaryTable title="ผลประกอบการแยกสาขา" rows={stats.branchRank} keyLabel="สาขา" highlight={branch} />
              <BranchMonthMatrix data={stats.matrix} highlight={branch} />
            </TabsContent>

            <TabsContent value="mix" className="mt-4 grid gap-4 lg:grid-cols-2">
              <SummaryTable title="แพ็กเกจขายดี" rows={stats.pkg} keyLabel="แพ็กเกจ" />
              <Donut title="จำนวนบิลตามแพ็กเกจ" data={stats.pkg} value={(r) => r.bills} unit="บิล" centerLabel="บิล" />
              <SummaryTable title="ประสิทธิภาพโปรโมชั่น" rows={stats.promo} keyLabel="โปรโมชั่น" showDiscount gpBaseline={stats.promo.find((r) => r.key === "ไม่มีโปร")?.gpPct} />
              <Donut title="จำนวนบิลตามโปรโมชั่น" data={stats.promo} value={(r) => r.bills} unit="บิล" centerLabel="บิล" />
              <SummaryTable title="ช่องทางชำระเงิน" rows={stats.pay} keyLabel="ช่องทาง" />
              <Donut title="สัดส่วนต้นทุน" description="อาหารเทียบเครื่องดื่ม" data={costRows(k.foodCost, k.bevCost)} value={(r) => r.sales} unit="บาท" centerLabel="ต้นทุนรวม" />
            </TabsContent>

            <TabsContent value="time" className="mt-4 grid gap-4 lg:grid-cols-2">
              <HourChart data={stats.hour} />
              <Heatmap matrix={stats.heat} />
            </TabsContent>

            <TabsContent value="bills" className="mt-4">
              <BillsTable rows={filtered} fileTag={`${branch === ALL ? "all" : branch}-${range.from}_${range.to}`} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function OpsAppBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-primary">
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-primary text-sm text-white">
              鍋
            </span>
            <span className="hidden sm:inline">สุกี้ตี๋ใหญ่</span>
          </Link>
          <span className="rounded-md bg-cocoa px-2 py-0.5 text-xs font-semibold text-gold">OPS</span>
        </div>
        <nav aria-label="เมนูหลังบ้าน" className="flex items-center gap-1 text-sm">
          <span aria-current="page" className="rounded-md bg-muted px-3 py-1.5 font-medium">
            Dashboard
          </span>
          <Link href="/landing" className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            หน้าร้าน ↗
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <OpsThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
          <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">OP</span>
          <div className="text-xs leading-tight">
            <p className="font-medium">ทีม Ops</p>
            <p className="text-muted-foreground">เดโม (ยังไม่มีระบบล็อกอิน)</p>
          </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Daily buckets with zero-filled gaps so the x-axis reflects real time. */
function fillDays(rows: GroupRow[], r: DateRange): GroupRow[] {
  const byKey = new Map(rows.map((x) => [x.key, x]));
  const out: GroupRow[] = [];
  for (let d = r.from; d <= r.to; d = addDays(d, 1)) {
    out.push(byKey.get(d) ?? { key: d, ...EMPTY_GROUP });
  }
  return out;
}

const share = (part: number, whole: number) => (whole ? `${((part / whole) * 100).toFixed(0)}%` : "0%");


function costRows(food: number, bev: number): GroupRow[] {
  return [
    { key: "อาหาร", ...EMPTY_GROUP, sales: food },
    { key: "เครื่องดื่ม", ...EMPTY_GROUP, sales: bev },
  ];
}

function Kpi({
  icon,
  label,
  value,
  sub,
  delta,
  invert = false,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  delta?: number | null;
  /** true when "up" is bad (e.g. cost) */
  invert?: boolean;
  highlight?: boolean;
}) {
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(delta);
  const good = hasDelta && (invert ? delta! <= 0 : delta! >= 0);

  return (
    <Card size="sm" className={cn(highlight && "bg-cocoa text-[#f3e6d6] ring-cocoa dark:bg-[#3a2822] dark:ring-gold/25")}>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("flex items-center gap-2 text-xs", highlight ? "text-[#d8c6bc]" : "text-muted-foreground")}>
            <span
              className={cn(
                "grid size-7 place-items-center rounded-md [&_svg]:size-3.5",
                highlight ? "bg-white/10 text-gold" : "bg-cream-deep text-gold-ink",
              )}
            >
              {icon}
            </span>
            {label}
          </span>
          {hasDelta ? (
            <span
              title="เทียบช่วงก่อนหน้า"
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                highlight
                  ? good
                    ? "bg-success/25 text-[#86efac]"
                    : "bg-danger/30 text-[#fca5a5]"
                  : good
                    ? "bg-success-soft text-success"
                    : "bg-danger-soft text-danger",
              )}
            >
              {delta! >= 0 ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
              {Math.abs(delta!).toFixed(1)}%
            </span>
          ) : null}
        </div>
        <p className="truncate font-heading text-xl font-semibold tabular-nums sm:text-2xl">{value}</p>
        {sub ? <p className={cn("-mt-1 truncate text-xs", highlight ? "text-[#d8c6bc]" : "text-muted-foreground")}>{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

function InsightsCard({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <LightbulbIcon className="size-4 text-[#d9a13a]" /> Insight อัตโนมัติ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((i) => (
            <li
              key={i.title}
              className={cn(
                "flex gap-3 rounded-xl border p-3",
                i.tone === "good" && "border-success/20 bg-success-soft",
                i.tone === "warn" && "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40",
                i.tone === "info" && "border-border bg-muted/50",
              )}
            >
              <span className="mt-0.5 shrink-0">
                {i.tone === "good" ? (
                  <ArrowUpRightIcon className="size-4 text-success" />
                ) : i.tone === "warn" ? (
                  <TriangleAlertIcon className="size-4 text-amber-700 dark:text-amber-400" />
                ) : (
                  <LightbulbIcon className="size-4 text-muted-foreground" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-medium">{i.title}</p>
                <p className="text-xs text-muted-foreground">{i.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SummaryTable({
  title,
  rows,
  keyLabel,
  highlight,
  gpBaseline,
  showDiscount = false,
}: {
  title: string;
  rows: GroupRow[];
  keyLabel: string;
  highlight?: string;
  gpBaseline?: number;
  showDiscount?: boolean;
}) {
  const total = rows.reduce((a, r) => a + r.sales, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{keyLabel}</TableHead>
              <TableHead className="text-right">บิล</TableHead>
              <TableHead className="text-right">ยอดขาย</TableHead>
              <TableHead className="text-right">สัดส่วน</TableHead>
              <TableHead className="text-right">เฉลี่ย/บิล</TableHead>
              {showDiscount ? <TableHead className="text-right">ส่วนลด</TableHead> : null}
              <TableHead className="text-right">GP%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const below = gpBaseline !== undefined && r.gpPct < gpBaseline - 1;
              return (
                <TableRow key={r.key} className={cn(highlight === r.key && "bg-cream-deep font-medium")}>
                  <TableCell className="font-medium">{r.key}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBaht(r.bills)}</TableCell>
                  <TableCell className="text-right tabular-nums">฿{formatBaht(r.sales)}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-2 tabular-nums">
                      <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:block">
                        <span className="block h-full bg-chart-1" style={{ width: `${total ? (r.sales / total) * 100 : 0}%` }} />
                      </span>
                      {total ? ((r.sales / total) * 100).toFixed(0) : 0}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">฿{formatBaht(r.avgBill)}</TableCell>
                  {showDiscount ? (
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {r.discount ? `฿${formatBaht(r.discount)}` : "–"}
                    </TableCell>
                  ) : null}
                  <TableCell className={cn("text-right tabular-nums", below && "font-semibold text-danger")}>
                    {r.gpPct.toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BranchMonthMatrix({
  data,
  highlight,
}: {
  data: ReturnType<typeof branchMonthMatrix>;
  highlight: string;
}) {
  const max = Math.max(1, ...data.rows.flatMap((r) => r.cells));
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-heading text-base">ยอดขายสาขา × เดือน</CardTitle>
        <p className="text-xs text-muted-foreground">
          สีเข้ม = ยอดขายสูง • MoM คือเดือนล่าสุดเทียบเดือนก่อน (เดือนล่าสุดอาจยังไม่ครบเดือน)
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สาขา</TableHead>
              {data.labels.map((m) => (
                <TableHead key={m} className="text-right">
                  {m}
                </TableHead>
              ))}
              <TableHead className="text-right">รวม</TableHead>
              <TableHead className="text-right">MoM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((r) => (
              <TableRow key={r.branch} className={cn(highlight === r.branch && "bg-cream-deep font-medium")}>
                <TableCell>{r.branch}</TableCell>
                {r.cells.map((v, i) => (
                  <TableCell key={data.months[i]} className="relative text-right tabular-nums">
                    <span aria-hidden className="absolute inset-0.5 rounded-md bg-chart-1" style={{ opacity: (v / max) * 0.35 }} />
                    <span className="relative">{(v / 1000).toFixed(1)}k</span>
                  </TableCell>
                ))}
                <TableCell className="text-right font-medium tabular-nums">฿{formatBaht(r.total)}</TableCell>
                <TableCell className="text-right">
                  {r.change === null ? (
                    "–"
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                        r.change >= 0 ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                      )}
                    >
                      {r.change >= 0 ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
                      {Math.abs(r.change).toFixed(0)}%
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
