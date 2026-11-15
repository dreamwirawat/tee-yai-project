import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span aria-hidden className="grid size-20 place-items-center rounded-full bg-primary text-4xl text-white shadow-[0_6px_0_#7d1420]">
        鍋
      </span>
      <p className="font-heading text-6xl font-extrabold text-primary">404</p>
      <h1 className="font-heading text-2xl font-semibold">หม้อนี้ว่างเปล่า… ไม่พบหน้าที่คุณหา</h1>
      <p className="max-w-sm text-muted-foreground">ลิงก์อาจไม่ถูกต้องหรือหน้านี้ถูกย้ายไปแล้ว</p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-2 h-11 rounded-full px-8")}>
        กลับหน้าแรก
      </Link>
    </main>
  );
}
