"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, DownloadIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBaht, type Transaction } from "@/lib/transactions";
import { cn } from "@/lib/utils";

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text },
});

const helper = createColumnHelper<typeof features, Transaction>();

const columns = helper.columns([
  helper.accessor("ts", { header: "วันที่เวลา" }),
  helper.accessor("id", { header: "เลขที่บิล" }),
  helper.accessor("branch", { header: "สาขา" }),
  helper.accessor("pkg", { header: "แพ็กเกจ" }),
  helper.accessor("guests", { header: "ลูกค้า" }),
  helper.accessor("promo", { header: "โปรโมชั่น" }),
  helper.accessor("pay", { header: "ชำระด้วย" }),
  helper.accessor("net", { header: "ยอดสุทธิ", cell: (c) => `฿${formatBaht(c.getValue())}` }),
  helper.accessor("gpPct", { header: "GP%", cell: (c) => `${c.getValue().toFixed(1)}%` }),
]);

const NUMERIC = new Set(["guests", "net", "gpPct"]);
const PAGE_SIZES = [10, 25, 50, 100];

const CSV_HEADERS: [keyof Transaction, string][] = [
  ["id", "เลขที่บิล"],
  ["ts", "วันที่เวลา"],
  ["branch", "สาขา"],
  ["pkg", "แพ็กเกจ"],
  ["guests", "จำนวนลูกค้า"],
  ["promo", "โปรโมชั่น"],
  ["pay", "ช่องทางชำระเงิน"],
  ["net", "ยอดขายสุทธิ"],
  ["foodCost", "ต้นทุนอาหาร"],
  ["bevCost", "ต้นทุนเครื่องดื่ม"],
  ["cost", "ต้นทุนรวม"],
  ["gp", "กำไรขั้นต้น"],
  ["gpPct", "GP%"],
];

function downloadCsv(rows: Transaction[], filename: string) {
  const esc = (v: unknown) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [CSV_HEADERS.map(([, h]) => h).join(","), ...rows.map((r) => CSV_HEADERS.map(([k]) => esc(r[k])).join(","))];
  // BOM so Excel opens Thai text as UTF-8
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function BillsTable({ rows, fileTag }: { rows: Transaction[]; fileTag: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const q = query.trim().toLowerCase();
  const data = useMemo(
    () =>
      q
        ? rows.filter((r) => [r.id, r.branch, r.pkg, r.promo, r.pay].some((v) => v.toLowerCase().includes(q)))
        : rows,
    [rows, q],
  );

  const table = useTable({ features, columns, data });
  const { pageIndex, pageSize } = table.state.pagination;
  const start = data.length === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(data.length, (pageIndex + 1) * pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">รายการบิล</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" disabled={data.length === 0} onClick={() => downloadCsv(data, `bills-${fileTag}.csv`)}>
            <DownloadIcon /> CSV
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="relative block max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              table.setPageIndex(0);
            }}
            placeholder="ค้นหาเลขบิล สาขา แพ็กเกจ โปร..."
            aria-label="ค้นหารายการบิล"
            className="h-9 w-full rounded-lg border border-input bg-card pr-3 pl-8 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const numeric = NUMERIC.has(header.column.id);
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(numeric && "text-right")}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                    >
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn("inline-flex items-center gap-1 font-medium", numeric && "flex-row-reverse")}
                      >
                        <table.FlexRender header={header} />
                        {sorted === "asc" ? (
                          <ArrowUpIcon className="size-3.5" />
                        ) : sorted === "desc" ? (
                          <ArrowDownIcon className="size-3.5" />
                        ) : (
                          <ArrowUpDownIcon className="size-3.5 opacity-40" />
                        )}
                      </button>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  ไม่พบรายการ
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  onClick={() => setSelected(row.original)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(row.original);
                    }
                  }}
                  className="cursor-pointer focus-visible:bg-muted focus-visible:outline-none"
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(NUMERIC.has(cell.column.id) && "text-right tabular-nums")}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {formatBaht(start)}–{formatBaht(end)} จาก {formatBaht(data.length)} บิล
          </span>
          <div className="flex items-center gap-2">
            <Select
              items={PAGE_SIZES.map((n) => ({ value: n, label: `${n} / หน้า` }))}
              value={pageSize}
              onValueChange={(v) => v && table.setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" aria-label="จำนวนแถวต่อหน้า">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n} / หน้า
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              ก่อนหน้า
            </Button>
            <span className="tabular-nums text-muted-foreground">
              {pageIndex + 1}/{Math.max(1, table.getPageCount())}
            </span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              ถัดไป
            </Button>
          </div>
        </div>
      </CardContent>

      <BillSheet bill={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}

function BillSheet({ bill, onClose }: { bill: Transaction | null; onClose: () => void }) {
  return (
    <Sheet open={!!bill} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {bill ? (
          <>
            <SheetHeader>
              <SheetTitle className="font-heading text-xl">บิล {bill.id}</SheetTitle>
              <SheetDescription>
                {bill.ts} น. • สาขา{bill.branch}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-5 px-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{bill.pkg}</Badge>
                <Badge variant="secondary">{bill.promo}</Badge>
                <Badge variant="outline">{bill.pay}</Badge>
              </div>
              <dl className="space-y-2">
                <Line label="จำนวนลูกค้า" value={`${bill.guests} ท่าน`} />
                <Line label="ยอดเฉลี่ยต่อท่าน" value={`฿${formatBaht(bill.net / bill.guests)}`} />
                <Separator />
                <Line label="ยอดขายสุทธิ" value={`฿${formatBaht(bill.net)}`} strong />
                <Line label="ต้นทุนอาหาร" value={`– ฿${formatBaht(bill.foodCost)}`} />
                <Line label="ต้นทุนเครื่องดื่ม" value={`– ฿${formatBaht(bill.bevCost)}`} />
                <Separator />
                <Line label="กำไรขั้นต้น" value={`฿${formatBaht(bill.gp)}`} strong />
              </dl>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>GP%</span>
                  <span>{bill.gpPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-chart-1" style={{ width: `${Math.min(100, bill.gpPct)}%` }} />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums", strong && "font-heading text-base font-semibold")}>{value}</dd>
    </div>
  );
}
