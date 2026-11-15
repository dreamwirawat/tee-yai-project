"use client";

import { useState } from "react";
import { th } from "react-day-picker/locale";
import type { DateRange as DayRange } from "react-day-picker";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatThaiShort, parseISODate, toISODate } from "@/lib/date";
import { PRESETS, matchPreset, presetRange, type Bounds, type DateRange } from "@/lib/ops";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  value,
  bounds,
  onChange,
}: {
  value: DateRange;
  bounds: Bounds;
  onChange: (r: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DayRange | undefined>();
  const preset = matchPreset(value, bounds);
  const label = PRESETS.find((p) => p.id === preset)?.label;

  const min = parseISODate(bounds.min);
  const max = parseISODate(bounds.max);

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) setDraft({ from: parseISODate(value.from), to: parseISODate(value.to) });
  };

  const apply = () => {
    if (draft?.from) {
      const from = toISODate(draft.from);
      onChange({ from, to: draft.to ? toISODate(draft.to) : from });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm whitespace-nowrap hover:border-primary/50"
        aria-label="เลือกช่วงวันที่"
      >
        <CalendarIcon className="size-4 text-gold-ink" />
        {label ? <span className="font-medium">{label}</span> : null}
        <span className={cn(label && "hidden text-muted-foreground sm:inline")}>
          {formatThaiShort(value.from)} – {formatThaiShort(value.to)}
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto max-w-[calc(100vw-2rem)] p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex gap-1 overflow-x-auto border-b border-border p-2 sm:w-36 sm:flex-col sm:border-r sm:border-b-0">
            {PRESETS.map((p) => (
              <Button
                key={p.id}
                variant={preset === p.id ? "secondary" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange(presetRange(p.id, bounds));
                  setOpen(false);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div>
            <Calendar
              mode="range"
              locale={th}
              numberOfMonths={2}
              selected={draft}
              onSelect={setDraft}
              defaultMonth={draft?.from ?? max}
              startMonth={min}
              endMonth={max}
              disabled={min && max ? [{ before: min }, { after: max }] : undefined}
              className="[--cell-size:--spacing(8)]"
            />
            <div className="flex items-center justify-between gap-2 border-t border-border p-2">
              <span className="text-xs text-muted-foreground">
                {draft?.from ? `${formatThaiShort(toISODate(draft.from))} – ${draft.to ? formatThaiShort(toISODate(draft.to)) : "…"}` : "เลือกวันเริ่มต้น"}
              </span>
              <Button size="sm" onClick={apply} disabled={!draft?.from}>
                ใช้ช่วงนี้
              </Button>
            </div>
          </div>
        </div>
        <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          ช่วงสำเร็จรูปอิงวันล่าสุดในข้อมูล ({formatThaiShort(bounds.max)})
        </p>
      </PopoverContent>
    </Popover>
  );
}
