"use client";

import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BookButton } from "@/components/landing/booking";
import { cn } from "@/lib/utils";

export type NavLink = { href: `#${string}`; label: string };

/** Tracks which section is currently under the sticky header. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // a thin band just below the header decides the active section
      { rootMargin: "-96px 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function SiteHeader({ links, brand }: { links: readonly NavLink[]; brand: string }) {
  // "home" is observed too, so nothing is highlighted while the hero is on screen.
  const [ids] = useState(() => ["home", ...links.map((l) => l.href.slice(1))]);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-[#fffaf2]/90 backdrop-blur transition-shadow",
        scrolled ? "border-border shadow-[0_6px_20px_#4b241412]" : "border-transparent",
      )}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 px-4 py-3 sm:px-6">
        <a href="#home" className="flex items-center gap-2.5 font-heading text-[22px] font-extrabold whitespace-nowrap text-primary">
          <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary text-xl text-white shadow-[0_4px_0_#7d1420]">
            鍋
          </span>
          {brand}
        </a>

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => {
            const isActive = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive ? "bg-cream-deep text-cocoa shadow-[inset_0_-2px_0_var(--gold)]" : "text-[#473b35] hover:text-cocoa",
                )}
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <BookButton className="hidden h-10 rounded-full px-5 font-semibold shadow-[0_4px_0_#7c1720] sm:inline-flex" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="เปิดเมนู"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card lg:hidden"
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-heading text-primary">{brand}</SheetTitle>
              </SheetHeader>
              <nav aria-label="เมนูมือถือ" className="flex flex-col gap-1 px-4">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-3 text-base font-medium hover:bg-accent",
                      active === l.href.slice(1) && "bg-cream-deep text-cocoa",
                    )}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
