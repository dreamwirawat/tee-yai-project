"use client";

import { createContext, use, useState } from "react";
import { th } from "react-day-picker/locale";
import { CalendarIcon, CheckCircle2Icon, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { formatThaiLong } from "@/lib/date";
import type { Catalog } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** `pkg` is the package key exactly as in the data, e.g. "พลัส 359 NET". */
type Preset = { pkg?: string; branch?: string };
export type BookingCatalog = Pick<Catalog, "packages" | "branches" | "hours">;
type BookingCtx = { openBooking: (preset?: Preset) => void };

const Ctx = createContext<BookingCtx | null>(null);

export function useBooking() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

type Form = {
  name: string;
  phone: string;
  branch: string;
  date: Date | undefined;
  time: string;
  guests: number;
  pkg: string;
};

const MIN_GUESTS = 1;
const MAX_GUESTS = 12;

const emptyForm = (p: Preset = {}, defaultPkg = ""): Form => ({
  name: "",
  phone: "",
  branch: p.branch ?? "",
  date: undefined,
  time: "",
  guests: 2,
  pkg: p.pkg ?? defaultPkg,
});

function validate(f: Form) {
  const errors: Partial<Record<keyof Form, string>> = {};
  if (!f.name.trim()) errors.name = "กรุณากรอกชื่อ";
  if (!/^0\d{8,9}$/.test(f.phone.replace(/[\s-]/g, ""))) errors.phone = "เบอร์โทร 9–10 หลัก ขึ้นต้นด้วย 0";
  if (!f.branch) errors.branch = "กรุณาเลือกสาขา";
  if (!f.date) errors.date = "กรุณาเลือกวันที่";
  if (!f.time) errors.time = "กรุณาเลือกเวลา";
  return errors;
}

export function BookingProvider({ children, catalog }: { children: React.ReactNode; catalog: BookingCatalog }) {
  const { packages, branches } = catalog;
  const slots = catalog.hours.map((h) => `${h}:00`);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(() => emptyForm({}, packages[0]?.key));
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  // Computed when the dialog opens (event time), never during render/prerender.
  const [range, setRange] = useState<{ today: Date; maxDate: Date } | null>(null);

  const openBooking = (preset?: Preset) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    setRange({ today, maxDate });
    setForm(emptyForm(preset, packages[0]?.key));
    setSubmitted(false);
    setShowErrors(false);
    setOpen(true);
  };

  const errors = validate(form);
  const err = (k: keyof Form) => (showErrors ? errors[k] : undefined);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const pkg = packages.find((p) => p.key === form.pkg) ?? packages[0];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    // TODO: เชื่อมต่อ API จองโต๊ะจริง (ตอนนี้เป็น UI เดโม)
    setSubmitted(true);
  };

  return (
    <Ctx value={{ openBooking }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
          {submitted ? (
            <div className="space-y-4 py-4 text-center">
              <CheckCircle2Icon className="mx-auto size-14 text-success" />
              <DialogTitle className="font-heading text-2xl">ส่งคำขอจองแล้ว</DialogTitle>
              <DialogDescription>
                คุณ{form.name} • สาขา{form.branch}
                <br />
                {form.date ? formatThaiLong(form.date) : ""} เวลา {form.time} น. • {form.guests} ท่าน • แพ็กเกจ{pkg?.name}
              </DialogDescription>
              <p className="rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
                เดโม: ยังไม่ได้เชื่อมต่อระบบจองจริง
              </p>
              <Button className="w-full" onClick={() => setOpen(false)}>
                เสร็จสิ้น
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">จองโต๊ะล่วงหน้า</DialogTitle>
                <DialogDescription>จองได้ล่วงหน้าสูงสุด 30 วัน</DialogDescription>
              </DialogHeader>

              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-medium">แพ็กเกจ</legend>
                <div className="grid grid-cols-2 gap-2">
                  {packages.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      role="radio"
                      aria-checked={form.pkg === p.key}
                      onClick={() => set("pkg", p.key)}
                      className={cn(
                        "rounded-xl border-2 p-3 text-left transition",
                        form.pkg === p.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                      )}
                    >
                      <p className="font-medium">{p.name}</p>
                      <p className="font-heading text-xl font-bold text-primary">฿{p.price}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="สาขา" id="bk-branch" error={err("branch")}>
                  <Select
                    items={branches.map((b) => ({ value: b, label: b }))}
                    value={form.branch || null}
                    onValueChange={(v) => set("branch", v ?? "")}
                  >
                    <SelectTrigger id="bk-branch" className="h-10 w-full" aria-invalid={!!err("branch")}>
                      <SelectValue placeholder="เลือกสาขา" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="จำนวนท่าน" id="bk-guests">
                  <div className="flex h-10 items-center justify-between rounded-lg border border-input px-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="ลดจำนวน"
                      disabled={form.guests <= MIN_GUESTS}
                      onClick={() => set("guests", form.guests - 1)}
                    >
                      <MinusIcon />
                    </Button>
                    <output id="bk-guests" className="font-medium tabular-nums">
                      {form.guests} ท่าน
                    </output>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="เพิ่มจำนวน"
                      disabled={form.guests >= MAX_GUESTS}
                      onClick={() => set("guests", form.guests + 1)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                </FormField>

                <FormField label="วันที่" id="bk-date" error={err("date")}>
                  <Popover>
                    <PopoverTrigger
                      id="bk-date"
                      aria-invalid={!!err("date")}
                      className="flex h-10 w-full items-center gap-2 rounded-lg border border-input px-3 text-left text-sm aria-invalid:border-destructive"
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {form.date ? formatThaiLong(form.date) : <span className="text-muted-foreground">เลือกวันที่</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={th}
                        selected={form.date}
                        onSelect={(d) => set("date", d)}
                        disabled={range ? [{ before: range.today }, { after: range.maxDate }] : undefined}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormField>

                <FormField label="เวลา" id="bk-time" error={err("time")}>
                  <Select items={slots.map((t) => ({ value: t, label: `${t} น.` }))} value={form.time || null} onValueChange={(v) => set("time", v ?? "")}>
                    <SelectTrigger id="bk-time" className="h-10 w-full" aria-invalid={!!err("time")}>
                      <SelectValue placeholder="เลือกเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                      {slots.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t} น.
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="ชื่อผู้จอง" id="bk-name" error={err("name")}>
                  <Input
                    id="bk-name"
                    className="h-10"
                    autoComplete="name"
                    value={form.name}
                    aria-invalid={!!err("name")}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </FormField>

                <FormField label="เบอร์โทร" id="bk-phone" error={err("phone")}>
                  <Input
                    id="bk-phone"
                    className="h-10"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="08x-xxx-xxxx"
                    value={form.phone}
                    aria-invalid={!!err("phone")}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </FormField>
              </div>

              <DialogFooter className="items-center gap-3 sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  ประมาณ <b className="text-foreground">฿{((pkg?.price ?? 0) * form.guests).toLocaleString("th-TH")}</b> (ก่อนส่วนลด)
                </p>
                <Button type="submit" size="lg" className="h-11 rounded-full px-8">
                  ยืนยันการจอง
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Ctx>
  );
}

function FormField({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Hero / final-CTA variant with the Magic UI shimmer border. */
export function ShimmerBookButton({
  className,
  children = "จองโต๊ะเลย",
  shimmerColor = "#ffd98d",
}: {
  className?: string;
  children?: React.ReactNode;
  shimmerColor?: string;
}) {
  const { openBooking } = useBooking();
  return (
    <ShimmerButton
      type="button"
      onClick={() => openBooking()}
      background="var(--primary)"
      shimmerColor={shimmerColor}
      shimmerDuration="2.5s"
      className={cn("h-12 px-8 text-base font-semibold shadow-[0_5px_0_#7c1720] hover:-translate-y-0.5", className)}
    >
      {children}
    </ShimmerButton>
  );
}

export function BookButton({
  pkg,
  branch,
  className,
  children = "จองโต๊ะ",
  variant = "default",
}: Preset & {
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
}) {
  const { openBooking } = useBooking();
  return (
    <Button type="button" variant={variant} className={className} onClick={() => openBooking({ pkg, branch })}>
      {children}
    </Button>
  );
}
