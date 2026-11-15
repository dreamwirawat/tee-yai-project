import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLinkIcon,
  HeartHandshakeIcon,
  LayersIcon,
  LeafIcon,
  MapPinIcon,
  NavigationIcon,
  ParkingSquareIcon,
  PhoneIcon,
  SoupIcon,
  StarIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";
import { BookButton, BookingProvider, ShimmerBookButton } from "@/components/landing/booking";
import { SiteHeader, type NavLink } from "@/components/landing/site-header";
import { getCatalog } from "@/lib/catalog";
import { formatThaiShort } from "@/lib/date";
import { formatBaht } from "@/lib/transactions";
import { cn } from "@/lib/utils";
import {
  BRANCH_INFO,
  DELIVERY,
  FALLBACK_PACKAGE_IMAGE,
  FEATURES,
  GALLERY,
  IMAGES,
  MENU_HIGHLIGHTS,
  PACKAGE_IMAGES,
  SHOP,
  mapsUrl,
} from "@/lib/shop";

const NAV: readonly NavLink[] = [
  { href: "#menu", label: "เมนูแนะนำ" },
  { href: "#packages", label: "แพ็กเกจ" },
  { href: "#promotions", label: "โปรโมชั่น" },
  { href: "#branches", label: "สาขา" },
  { href: "#about", label: "เกี่ยวกับเรา" },
];

export const metadata: Metadata = {
  title: "สุกี้ตี๋ใหญ่ | อร่อยเต็มหม้อ",
  description: "สุกี้ตี๋ใหญ่ 7 สาขา แพ็กเกจ 279 และ 359 NET",
};

const FEATURE_ICONS = { leaf: LeafIcon, soup: SoupIcon, heart: HeartHandshakeIcon } as const;

export default function HomePage() {
  // Every fact below comes from the xlsx via getCatalog(); copy comes from the template (lib/shop.ts).
  const catalog = getCatalog();
  const { packages, promos, branches, payments, stats } = catalog;
  const topSeller = [...packages].sort((a, b) => b.billShare - a.billShare)[0];
  const priceRange = packages.map((p) => p.price).join(" / ");
  const minPrice = Math.min(...packages.map((p) => p.price));

  const delivery = DELIVERY.filter((d) => d.url);
  const socials = [
    { label: "LINE", href: SHOP.line ? `https://line.me/R/ti/p/${encodeURIComponent(SHOP.line)}` : "" },
    { label: "Facebook", href: SHOP.facebook },
    { label: "Instagram", href: SHOP.instagram },
    { label: "TikTok", href: SHOP.tiktok },
  ].filter((s) => s.href);

  const ticker = [...SHOP.topbar, ...promos.map((p) => (p.deal ? `${p.label} ${p.deal}` : p.label)), `${branches.length} สาขา`];

  return (
    <BookingProvider catalog={{ packages, branches, hours: catalog.hours }}>
      {/* Top ticker (Magic UI Marquee) */}
      <div className="bg-cocoa text-[13px] text-[#f3e6d6]">
        <Marquee pauseOnHover repeat={3} className="py-2 [--duration:45s] [--gap:2.5rem]">
          {ticker.map((t) => (
            <span key={t} className="flex items-center gap-2.5 whitespace-nowrap">
              <span aria-hidden className="text-gold">✦</span>
              {t}
            </span>
          ))}
        </Marquee>
      </div>

      <SiteHeader links={NAV} brand={SHOP.name} />

      <main>
        {/* HERO */}
        <section id="home" className="relative isolate flex min-h-[620px] items-center overflow-hidden text-white">
          <Image src={IMAGES.hero} alt="หม้อสุกี้พร้อมวัตถุดิบหลากหลาย" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1c0f0b]/95 via-[#2b1d19]/80 to-[#2b1d19]/20" />
          <div className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6">
            <BlurFade delay={0.05}>
              <p className="text-[13px] font-semibold tracking-[2px] text-[#ffd98d]">{SHOP.kicker}</p>
            </BlurFade>
            <BlurFade delay={0.15}>
              <h1 className="mt-4 mb-5 max-w-[680px] font-heading text-[clamp(40px,6.5vw,76px)] leading-[1.1] font-extrabold">
                ความสุขคำใหญ่
                <br />
                <span className="text-[#ffd98d] [text-shadow:0_2px_18px_rgb(0_0_0/0.45)]">เริ่มต้นที่หม้อสุกี้</span>
              </h1>
            </BlurFade>
            <BlurFade delay={0.25}>
              <p className="mb-8 max-w-[540px] text-[17px] leading-[1.9] text-[#fff3e6]">{SHOP.heroText}</p>
            </BlurFade>
            <BlurFade delay={0.35}>
              <div className="flex flex-wrap items-center gap-3">
                <ShimmerBookButton />
                <a
                  href="#packages"
                  className="inline-flex h-12 items-center rounded-full border border-white/60 px-6 text-sm font-medium backdrop-blur hover:bg-white/10"
                >
                  ดูแพ็กเกจ ฿{priceRange}
                </a>
              </div>
            </BlurFade>

            <BlurFade delay={0.45}>
              <dl className="mt-12 grid max-w-[560px] grid-cols-3 gap-4 border-t border-white/20 pt-6">
                <HeroStat value={`${formatBaht(stats.guests)}`} label={`ลูกค้าใน ${stats.months} เดือน`} />
                <HeroStat value={`${branches.length}`} label="สาขา" />
                <HeroStat value={`฿${minPrice}`} label="เริ่มต้น NET / ท่าน" />
              </dl>
            </BlurFade>
          </div>
        </section>

        {/* FEATURES (template copy) */}
        <div className="relative mx-auto -mt-10 grid max-w-[1180px] gap-4 px-4 sm:px-6 md:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = FEATURE_ICONS[f.icon];
            return (
              <BlurFade key={f.title} delay={0.1 * i} inView>
                <Card className="h-full shadow-[0_12px_30px_#4b241414]">
                  <CardContent className="flex items-start gap-4 py-1">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cream-deep text-gold-ink ring-1 ring-gold/40">
                      <Icon className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
                      <p className="text-[13px] text-muted-foreground">{f.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </BlurFade>
            );
          })}
        </div>

        {/* MENU HIGHLIGHTS (template copy) — white band */}
        <Band className="mt-16 bg-card">
          <Section id="menu">
            <SectionHead eyebrow="OUR FAVORITES" title="เมนูแนะนำ" sub="เลือกความอร่อยในแบบที่คุณชอบ" />
            <div className="grid gap-5 md:grid-cols-3">
              {MENU_HIGHLIGHTS.map((m, i) => (
                <BlurFade key={m.title} delay={0.08 * i} inView>
                  <article className="group h-full overflow-hidden rounded-2xl border border-border bg-background">
                    <div className="relative h-52 overflow-hidden">
                      <Image src={m.image} alt={m.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                      <Badge className="absolute top-3 left-3 bg-cocoa text-gold">{m.tag}</Badge>
                    </div>
                    <div className="space-y-1.5 p-5">
                      <h3 className="font-heading text-xl font-semibold">{m.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{m.text}</p>
                    </div>
                  </article>
                </BlurFade>
              ))}
            </div>
          </Section>
        </Band>

        {/* PACKAGES (xlsx) — cream */}
        <Section id="packages">
          <SectionHead eyebrow="OUR PACKAGES" title="เลือกแพ็กเกจที่ใช่" sub="ราคาต่อท่าน (NET)" />
          <div className="grid gap-6 md:grid-cols-2">
            {packages.map((p, i) => {
              const isTop = p.key === topSeller?.key;
              return (
                <BlurFade key={p.key} delay={0.1 * i} inView>
                  <Card className={cn("relative h-full overflow-hidden p-0", isTop && "ring-gold/60")}>
                    {isTop ? <BorderBeam size={140} duration={8} colorFrom="#ffd98d" colorTo="#e7b45a" borderWidth={2} /> : null}
                    <div className="relative h-[220px]">
                      <Image
                        src={PACKAGE_IMAGES[p.name] ?? FALLBACK_PACKAGE_IMAGE}
                        alt={`แพ็กเกจ${p.name}`}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                      {isTop ? (
                        <Badge className="absolute top-4 left-4 h-7 gap-1 rounded-full bg-gold px-3 text-cocoa">
                          <StarIcon className="size-3 fill-current" /> ลูกค้าเลือกมากที่สุด
                        </Badge>
                      ) : null}
                    </div>
                    <CardContent className="flex flex-col gap-4 p-6">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <h3 className="font-heading text-2xl font-semibold">แพ็กเกจ{p.name}</h3>
                          <p className="text-sm text-muted-foreground">{p.key}</p>
                        </div>
                        <p className="shrink-0 text-right font-heading text-4xl font-bold text-primary">
                          ฿{p.price}
                          <span className="block text-xs font-normal text-muted-foreground">NET / ท่าน</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-cream-deep px-3 py-1 text-gold-ink">{p.billShare}% ของบิลทั้งหมด</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-cream-deep px-3 py-1 text-gold-ink">
                          <UsersIcon className="size-3" /> เฉลี่ย {p.avgParty.toFixed(1)} ท่าน/โต๊ะ
                        </span>
                      </div>
                      <BookButton pkg={p.key} variant={isTop ? "default" : "outline"} className="h-11 w-full rounded-full font-semibold">
                        จองแพ็กเกจ{p.name}
                      </BookButton>
                    </CardContent>
                  </Card>
                </BlurFade>
              );
            })}
          </div>
        </Section>

        {/* PROMOTIONS (xlsx) — warm cream with dot texture */}
        <Band className="bg-cream-deep bg-[radial-gradient(#e7b45a33_1px,transparent_1px)] [background-size:18px_18px]">
          <Section id="promotions">
            <SectionHead eyebrow="SPECIAL DEALS" title="โปรโมชั่น" sub={`${SHOP.groupInvite} ${SHOP.groupInviteSub}`} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {promos.map((p, i) => (
                <BlurFade key={p.key} delay={0.08 * i} inView>
                  <div className="flex h-full flex-col rounded-2xl border-t-4 border-gold bg-card p-5 shadow-[0_10px_24px_#4b24140f]">
                    <p className="text-sm font-medium text-gold-ink">{p.deal ? p.label : "โปรกลุ่ม"}</p>
                    <p className="my-1 font-heading text-3xl font-bold text-primary">{p.deal ?? p.label}</p>
                    <p className="mt-auto pt-3 text-xs text-muted-foreground">ใช้แล้ว {formatBaht(p.bills)} บิล</p>
                  </div>
                </BlurFade>
              ))}
            </div>
          </Section>
        </Band>

        {/* NUMBERS (xlsx) + link to real reviews */}
        <Section className="py-14 md:py-16">
          <div className="grid items-center gap-8 rounded-3xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Stat label={`ลูกค้าใน ${stats.months} เดือน`} value={formatBaht(stats.guests)} />
              <Stat label="บิล" value={formatBaht(stats.bills)} />
              <Stat label="สาขา" value={`${branches.length}`} />
              <Stat label="จ่ายเฉลี่ยต่อท่าน" value={`฿${formatBaht(stats.avgPerHead)}`} />
            </dl>
            <div className="space-y-3 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <h2 className="font-heading text-2xl font-bold">อยากรู้ว่าอร่อยแค่ไหน?</h2>
              <p className="text-sm text-muted-foreground">อ่านรีวิวจริงจากลูกค้าได้บน Google Maps</p>
              <a
                href={SHOP.reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium hover:border-gold"
              >
                อ่านรีวิวบน Google Maps <ExternalLinkIcon className="size-4" />
              </a>
              <p className="text-[11px] text-muted-foreground">
                ตัวเลขจากข้อมูลการขาย {formatThaiShort(stats.from)} – {formatThaiShort(stats.to)}
              </p>
            </div>
          </div>
        </Section>

        {/* BRANCHES (xlsx) — white */}
        <Band className="bg-card">
          <Section id="branches">
            <SectionHead eyebrow="OUR BRANCHES" title={`${branches.length} สาขาใกล้คุณ`} sub="กดไอคอนนำทางเพื่อเปิดแผนที่" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((name, i) => {
                const info = BRANCH_INFO[name];
                return (
                  <BlurFade key={name} delay={0.04 * i} inView>
                    <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream-deep text-gold-ink">
                            <MapPinIcon className="size-5" />
                          </span>
                          <h3 className="font-heading text-lg font-semibold">สาขา{name}</h3>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <a
                            href={mapsUrl(name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`เปิดแผนที่สาขา${name}`}
                            className="grid size-9 place-items-center rounded-full border border-border bg-card hover:border-gold hover:text-gold-ink"
                          >
                            <NavigationIcon className="size-4" />
                          </a>
                          <BookButton branch={name} variant="secondary" className="h-9 rounded-full px-4">
                            จอง
                          </BookButton>
                        </div>
                      </div>
                      {info && (info.phone || info.floor || info.parking) ? (
                        <ul className="space-y-1 border-t border-dashed border-border pt-3 text-xs text-muted-foreground">
                          {info.floor ? <li className="flex items-center gap-1.5"><LayersIcon className="size-3.5" /> {info.floor}</li> : null}
                          {info.parking ? <li className="flex items-center gap-1.5"><ParkingSquareIcon className="size-3.5" /> {info.parking}</li> : null}
                          {info.phone ? (
                            <li>
                              <a href={`tel:${info.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                                <PhoneIcon className="size-3.5" /> {info.phone}
                              </a>
                            </li>
                          ) : null}
                        </ul>
                      ) : null}
                    </div>
                  </BlurFade>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <WalletIcon className="size-4 text-gold-ink" />
              รับชำระ:
              {payments.map((p) => (
                <Badge key={p} variant="secondary">
                  {p}
                </Badge>
              ))}
            </div>
          </Section>
        </Band>

        {/* ABOUT (template copy) + GALLERY — cream */}
        <Section id="about" className="pb-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <BlurFade inView direction="right" className="relative">
              <div className="relative h-[360px] overflow-hidden rounded-3xl">
                <Image src={IMAGES.about} alt="เพื่อน ๆ ทานอาหารร่วมกัน" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="absolute -right-3 -bottom-6 hidden h-40 w-40 overflow-hidden rounded-2xl border-4 border-background shadow-xl sm:block">
                <Image src={IMAGES.aboutSecondary} alt="วัตถุดิบสำหรับสุกี้" fill sizes="160px" className="object-cover" />
              </div>
            </BlurFade>
            <BlurFade inView direction="left" delay={0.1}>
              <p className="text-[13px] font-bold tracking-[1.8px] text-gold-ink">ABOUT US</p>
              <h2 className="my-2 font-heading text-4xl font-bold text-cocoa">
                {SHOP.name}
                <br />
                {SHOP.aboutTitle}
              </h2>
              <p className="leading-[1.9] text-muted-foreground">{SHOP.aboutText}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {SHOP.aboutPills.map((p) => (
                  <span key={p} className="rounded-full bg-secondary px-3.5 py-2 text-xs text-secondary-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </BlurFade>
          </div>
        </Section>

        <div className="pb-16" aria-label="ภาพบรรยากาศ">
          <Marquee pauseOnHover repeat={2} className="[--duration:60s] [--gap:1rem]">
            {GALLERY.map((g) => (
              <div key={g.src} className="relative h-48 w-72 overflow-hidden rounded-2xl sm:h-56 sm:w-80">
                <Image src={g.src} alt={g.alt} fill sizes="320px" className="object-cover" />
              </div>
            ))}
          </Marquee>
        </div>

        {/* DELIVERY — shown only when links are configured */}
        {delivery.length > 0 ? (
          <Section className="pt-0">
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row">
              <h2 className="font-heading text-2xl font-bold">สั่งเดลิเวอรี</h2>
              <div className="flex flex-wrap gap-2">
                {delivery.map((d) => (
                  <a
                    key={d.name}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium hover:border-gold"
                  >
                    {d.name}
                  </a>
                ))}
              </div>
            </div>
          </Section>
        ) : null}

        {/* FINAL CTA (template promo-banner copy) */}
        <Section className="pt-0 pb-16">
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep via-[#94202a] to-primary px-6 py-14 text-center text-white">
            <span aria-hidden className="pointer-events-none absolute -top-10 -right-6 -z-10 font-heading text-[220px] leading-none text-white/[0.06]">
              鍋
            </span>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">{SHOP.groupInvite}</h2>
            <p className="mx-auto mt-3 mb-7 max-w-md text-[#ffe6d5]">{SHOP.groupInviteSub}</p>
            <ShimmerBookButton className="mx-auto px-10" shimmerColor="#ffffff">
              จองโต๊ะออนไลน์
            </ShimmerBookButton>
          </div>
        </Section>
      </main>

      <footer id="contact" className="bg-cocoa px-4 pt-12 pb-28 text-white sm:px-6 md:pb-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-xl font-extrabold">{SHOP.name}</p>
            <p className="mt-2 text-[13px] leading-[1.8] text-[#d8c6bc]">{SHOP.tagline}</p>
            {socials.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-gold hover:text-gold"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <FooterCol title="สาขา">
            <p>{branches.join(" • ")}</p>
            {SHOP.phone ? (
              <a href={`tel:${SHOP.phone}`} className="flex items-center gap-2 hover:text-white">
                <PhoneIcon className="size-4 text-gold" /> {SHOP.phone}
              </a>
            ) : null}
          </FooterCol>
          <FooterCol title="เมนูเว็บไซต์">
            {NAV.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </a>
            ))}
          </FooterCol>
          <FooterCol title="สำหรับทีมงาน">
            <Link href="/" className="text-gold hover:underline">
              ระบบหลังบ้าน (Ops)
            </Link>
          </FooterCol>
        </div>
        <p className="mx-auto mt-10 max-w-[1180px] border-t border-white/10 pt-6 text-xs text-[#9c8a80]">
          © {SHOP.name} • ภาพประกอบจาก Unsplash
        </p>
      </footer>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-[#fffaf2]/95 p-3 backdrop-blur md:hidden">
        <a
          href="#branches"
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-sm font-medium"
        >
          <MapPinIcon className="size-4" /> หาสาขา
        </a>
        <BookButton className="h-11 flex-[2] rounded-full font-semibold">จองโต๊ะเลย</BookButton>
      </div>
    </BookingProvider>
  );
}

/** Full-bleed background wrapper so sections can alternate colours. */
function Band({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}

function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-20", className)}>
      {children}
    </section>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <BlurFade inView className="mb-10 text-center">
      <p className="text-[13px] font-bold tracking-[1.8px] text-gold-ink">{eyebrow}</p>
      <h2 className="my-2 font-heading text-[32px] font-bold text-cocoa sm:text-4xl">{title}</h2>
      <p className="text-muted-foreground">{sub}</p>
    </BlurFade>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-[#fff3e6]/80">{label}</dt>
      <dd className="font-heading text-2xl font-bold sm:text-3xl">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-heading text-3xl font-bold text-cocoa tabular-nums sm:text-4xl">{value}</dd>
    </div>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-[13px] text-[#d8c6bc]">
      <b className="mb-1 text-sm text-white">{title}</b>
      {children}
    </div>
  );
}
