import { Suspense } from "react";
import type { Metadata } from "next";
import { OpsDashboard } from "@/components/ops/dashboard";
import { loadTransactions } from "@/lib/transactions";

export const metadata: Metadata = {
  title: "Ops Dashboard | สุกี้ตี๋ใหญ่",
  robots: { index: false, follow: false },
};

export default function OpsPage() {
  // Static JSON import → resolved at build time. Filters live in the URL and are
  // read on the client (useSearchParams), so the dashboard sits behind Suspense.
  const rows = loadTransactions();
  return (
    <Suspense fallback={<OpsSkeleton />}>
      <OpsDashboard rows={rows} />
    </Suspense>
  );
}

function OpsSkeleton() {
  const block = "animate-pulse rounded-xl bg-muted";
  return (
    <div aria-busy="true" aria-label="กำลังโหลดแดชบอร์ด" className="min-h-dvh bg-background">
      <div className="h-14 border-b border-border bg-card" />
      <div className="mx-auto max-w-[1320px] space-y-5 px-4 py-6 md:px-6">
        <div className={`${block} h-12 w-72`} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={`${block} h-[104px]`} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className={`${block} h-[340px] lg:col-span-2`} />
          <div className={`${block} h-[340px]`} />
        </div>
      </div>
    </div>
  );
}
