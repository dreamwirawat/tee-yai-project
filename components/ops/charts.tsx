"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DAY_LABELS, formatBaht, formatCompact, monthLabel, type GroupRow } from "@/lib/transactions";
import { cn } from "@/lib/utils";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-heading text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function Empty() {
  return <p className="py-12 text-center text-sm text-muted-foreground">ไม่มีข้อมูลในช่วงที่เลือก</p>;
}

const baht = (v: unknown) => `฿${formatBaht(Number(v))}`;

/**
 * Sales trend. `granularity` decides the bucket: daily for short ranges (so a
 * one-month view is readable), monthly otherwise. Daily keys are "YYYY-MM-DD".
 */
export function TrendChart({ data, granularity }: { data: GroupRow[]; granularity: "day" | "month" }) {
  const config = {
    sales: { label: "ยอดขาย", color: "var(--chart-1)" },
    gp: { label: "กำไรขั้นต้น", color: "var(--chart-2)" },
  } satisfies ChartConfig;
  const label = (key: string) =>
    granularity === "month" ? monthLabel(key) : `${Number(key.slice(8, 10))} ${monthLabel(key.slice(0, 7))}`;
  const rows = data.map((d) => ({ bucket: label(d.key), sales: d.sales, gp: d.gp }));

  return (
    <ChartCard
      title={granularity === "month" ? "ยอดขายรายเดือน" : "ยอดขายรายวัน"}
      description="ยอดขายสุทธิเทียบกำไรขั้นต้น (บาท)"
      className="lg:col-span-2"
    >
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <ChartContainer config={config} className="h-[280px] w-full">
          <BarChart data={rows} accessibilityLayer barGap={granularity === "day" ? 0 : 4}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis tickFormatter={formatCompact} tickLine={false} axisLine={false} width={44} />
            <ChartTooltip content={<ChartTooltipContent formatter={baht} />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={granularity === "day" ? 2 : 4} maxBarSize={48} isAnimationActive={false} />
            <Bar dataKey="gp" fill="var(--color-gp)" radius={granularity === "day" ? 2 : 4} maxBarSize={48} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

export function BranchChart({ data, highlight }: { data: GroupRow[]; highlight?: string }) {
  const config = { sales: { label: "ยอดขาย", color: "var(--chart-1)" } } satisfies ChartConfig;
  const rows = data.map((d) => ({ branch: d.key, sales: d.sales }));

  return (
    <ChartCard title="ยอดขายแยกสาขา" description="เรียงจากมากไปน้อย (บาท)">
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <ChartContainer config={config} className="h-[300px] w-full">
          <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }} accessibilityLayer>
            <CartesianGrid horizontal={false} />
            <YAxis dataKey="branch" type="category" tickLine={false} axisLine={false} width={92} />
            <XAxis type="number" tickFormatter={formatCompact} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent hideLabel formatter={baht} />} />
            <Bar dataKey="sales" radius={4} isAnimationActive={false}>
              {rows.map((r) => (
                <Cell
                  key={r.branch}
                  fill="var(--color-sales)"
                  fillOpacity={!highlight || highlight === r.branch ? 1 : 0.25}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

export function Donut({
  title,
  description,
  data,
  unit,
  value,
  centerLabel,
}: {
  title: string;
  description?: string;
  data: GroupRow[];
  unit: "บาท" | "บิล";
  value: (r: GroupRow) => number;
  centerLabel: string;
}) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.key, { label: d.key, color: COLORS[i % COLORS.length] }]),
  );
  const rows = data.map((d, i) => ({ name: d.key, value: value(d), fill: COLORS[i % COLORS.length] }));
  const total = rows.reduce((a, r) => a + r.value, 0);
  const fmt = (n: number) => (unit === "บาท" ? `฿${formatCompact(n)}` : formatBaht(n));

  return (
    <ChartCard title={title} description={description}>
      {rows.length === 0 || total === 0 ? (
        <Empty />
      ) : (
        <ChartContainer config={config} className="mx-auto h-[280px] w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="name"
                  formatter={(v, name) => (
                    <span className="flex w-full justify-between gap-3">
                      <span className="text-muted-foreground">{String(name)}</span>
                      <span className="font-medium tabular-nums">
                        {formatBaht(Number(v))} {unit} ({((Number(v) / total) * 100).toFixed(1)}%)
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={62} outerRadius={95} strokeWidth={3} isAnimationActive={false}>
              {rows.map((r) => (
                <Cell key={r.name} fill={r.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox)) return null;
                  const { cx, cy } = viewBox as { cx: number; cy: number };
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={cx} y={cy - 6} className="fill-foreground font-heading text-xl font-bold">
                        {fmt(total)}
                      </tspan>
                      <tspan x={cx} y={cy + 16} className="fill-muted-foreground text-xs">
                        {centerLabel}
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-wrap" />} />
          </PieChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

export function HourChart({ data }: { data: { hour: string; bills: number }[] }) {
  const config = { bills: { label: "จำนวนบิล", color: "var(--chart-1)" } } satisfies ChartConfig;
  const hasData = data.some((d) => d.bills > 0);

  return (
    <ChartCard title="จำนวนบิลรายชั่วโมง" description="ดูช่วงเวลาที่ลูกค้าเข้าร้านมาก" className="lg:col-span-2">
      {!hasData ? (
        <Empty />
      ) : (
        <ChartContainer config={config} className="h-[240px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={2} />
            <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="bills" fill="var(--color-bills)" radius={4} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

const cellOpacity = (v: number, max: number) => (v === 0 ? 0.06 : 0.18 + (v / max) * 0.82);

export function Heatmap({ matrix }: { matrix: number[][] }) {
  const max = Math.max(1, ...matrix.flat());
  const total = matrix.flat().reduce((a, b) => a + b, 0);
  const [sel, setSel] = useState<{ d: number; h: number } | null>(null);
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const pad = (h: number) => String(h).padStart(2, "0");

  return (
    <ChartCard
      title="Heatmap วัน × ชั่วโมง"
      description="จำนวนบิลในแต่ละช่วง ยิ่งเข้มยิ่งแน่น"
      className="lg:col-span-2"
      action={
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          น้อย
          {[0.15, 0.4, 0.65, 1].map((o) => (
            <span key={o} className="size-3 rounded-[3px] bg-chart-1" style={{ opacity: o }} />
          ))}
          มาก
        </div>
      }
    >
      {total === 0 ? (
        <Empty />
      ) : (
        <>
          <p aria-live="polite" className="mb-3 h-5 text-sm">
            {sel ? (
              <>
                <b>
                  {DAY_LABELS[sel.d]} {pad(sel.h)}:00–{pad((sel.h + 1) % 24)}:00
                </b>{" "}
                <span className="text-muted-foreground">• {matrix[sel.d][sel.h]} บิล</span>
              </>
            ) : (
              <span className="text-muted-foreground">ชี้หรือแตะช่องเพื่อดูจำนวนบิล</span>
            )}
          </p>
          <div className="overflow-x-auto pb-1">
            <div
              className="grid min-w-[620px] grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] gap-[3px] text-[10px] text-muted-foreground"
              onMouseLeave={() => setSel(null)}
            >
              <span />
              {hours.map((h) => (
                <span key={h} className="text-center">
                  {h % 3 === 0 ? pad(h) : ""}
                </span>
              ))}
              {matrix.map((row, d) => (
                <HeatRow key={d} day={d} row={row} max={max} sel={sel} onSelect={setSel} />
              ))}
            </div>
          </div>
        </>
      )}
    </ChartCard>
  );
}

function HeatRow({
  day,
  row,
  max,
  sel,
  onSelect,
}: {
  day: number;
  row: number[];
  max: number;
  sel: { d: number; h: number } | null;
  onSelect: (s: { d: number; h: number }) => void;
}) {
  return (
    <>
      <span className="flex items-center text-xs">{DAY_LABELS[day]}</span>
      {row.map((v, h) => (
        <button
          key={h}
          type="button"
          aria-label={`${DAY_LABELS[day]} ${h}:00 น. ${v} บิล`}
          onMouseEnter={() => onSelect({ d: day, h })}
          onFocus={() => onSelect({ d: day, h })}
          onClick={() => onSelect({ d: day, h })}
          className={cn(
            "aspect-square rounded-[3px] bg-chart-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            sel?.d === day && sel.h === h && "ring-2 ring-foreground",
          )}
          style={{ opacity: cellOpacity(v, max) }}
        />
      ))}
    </>
  );
}
