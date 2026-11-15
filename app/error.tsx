"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span aria-hidden className="grid size-20 place-items-center rounded-full bg-primary text-4xl text-white shadow-[0_6px_0_#7d1420]">
        鍋
      </span>
      <h1 className="font-heading text-2xl font-semibold">น้ำซุปล้นหม้อ… เกิดข้อผิดพลาดบางอย่าง</h1>
      <p className="max-w-sm text-muted-foreground">ลองใหม่อีกครั้ง หากยังไม่ได้ กรุณาไปที่หน้าร้าน</p>
      <div className="mt-2 flex gap-3">
        <Button size="lg" className="h-11 rounded-full px-8" onClick={() => retry()}>
          ลองอีกครั้ง
        </Button>
        <Link href="/landing" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-full px-8")}>
          ไปหน้าร้าน
        </Link>
      </div>
    </main>
  );
}
