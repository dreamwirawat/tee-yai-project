/**
 * Storefront copy & media.
 *
 * Content sources (per the brief): ONLY
 *  1. the BF313 xlsx  → facts (packages, prices, promos, branches, payments, numbers) — see lib/catalog.ts
 *  2. the Assignment 4 index.html template → marketing copy below (taglines, features, menu text, about)
 * Images are from Unsplash (free license) and are illustrative only.
 */

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const SHOP = {
  name: "สุกี้ตี๋ใหญ่",
  // template: hero / footer
  tagline: "ความสุขคำใหญ่ เริ่มต้นที่หม้อสุกี้",
  kicker: "SU KI TEE YAI • GOOD FOOD, GOOD MOOD",
  heroText:
    "รวมความอร่อยไว้ในหม้อเดียว กับวัตถุดิบหลากหลาย น้ำซุปเข้มข้น และน้ำจิ้มรสเด็ด ชวนครอบครัวและเพื่อน ๆ มาอิ่มอร่อยด้วยกัน",
  // template: topbar
  topbar: ["หม้อร้อนพร้อมเสิร์ฟทุกวัน", "อิ่มอร่อยกับคนที่คุณรัก"],
  // template: promo banner
  groupInvite: "มื้อนี้…ชวนแก๊งมาอิ่มด้วยกัน!",
  groupInviteSub: "ความอร่อยที่แบ่งปันได้ ยิ่งมากันหลายคนยิ่งสนุก",
  // template: about
  aboutTitle: "อร่อยง่าย ๆ ได้ทุกวัน",
  aboutText:
    "เราอยากให้ทุกมื้อเป็นช่วงเวลาที่น่าจดจำ ไม่ว่าจะมาทานกับครอบครัว เพื่อน หรือคนพิเศษ ก็สามารถสร้างความสุขรอบโต๊ะอาหารไปด้วยกัน",
  aboutPills: ["เมนูหลากหลาย", "เหมาะกับทุกวัย", "บรรยากาศเป็นกันเอง"],

  // Contact details are not in the provided files → empty = hidden on the page.
  phone: "",
  line: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  /** Real reviews live on Google Maps — link out rather than writing our own. */
  reviewsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("สุกี้ตี๋ใหญ่")}`,
} as const;

/** template: 3 feature cards */
export const FEATURES = [
  { icon: "leaf", title: "วัตถุดิบคัดสรร", text: "เลือกวัตถุดิบหลากหลาย สดใหม่ พร้อมเสิร์ฟ" },
  { icon: "soup", title: "น้ำซุปกลมกล่อม", text: "ซุปหอมละมุน เติมความอร่อยได้ทุกคำ" },
  { icon: "heart", title: "อิ่มอร่อยพร้อมหน้า", text: "พื้นที่แห่งความสุขสำหรับทุกมื้อพิเศษ" },
] as const;

/**
 * template: "เมนูแนะนำ" cards. The template's prices (฿299/129/79) were marked as
 * sample data and conflict with the xlsx, so prices are intentionally omitted.
 */
export const MENU_HIGHLIGHTS = [
  {
    title: "ชุดสุกี้หม้อใหญ่",
    tag: "ขายดี",
    text: "รวมเนื้อสัตว์ ผักสด และลูกชิ้นหลากชนิด เหมาะสำหรับแบ่งปัน",
    image: unsplash("1614104030967-5ca61a54247b", 900),
  },
  {
    title: "เนื้อสไลซ์พรีเมียม",
    tag: "แนะนำ",
    text: "เนื้อนุ่มสไลซ์บาง จุ่มในน้ำซุปร้อน ๆ เพิ่มความฟินทุกคำ",
    image: unsplash("1768528355986-5af2329fd005", 900),
  },
  {
    title: "ผักรวมเพื่อสุขภาพ",
    tag: "สดใหม่",
    text: "ผักหลากสี เพิ่มความสดชื่นและสมดุลให้ทุกมื้อ",
    image: unsplash("1787287247565-6493305ea424", 900),
  },
] as const;

export const IMAGES = {
  hero: unsplash("1614104030967-5ca61a54247b", 2000),
  about: unsplash("1528605248644-14dd04022da1"),
  aboutSecondary: unsplash("1703945530505-2f06e3e1cf97", 800),
} as const;

/** Illustrative photo per package (keyed by the short package name from the data). */
export const PACKAGE_IMAGES: Record<string, string> = {
  ธรรมดา: unsplash("1774101074569-b669d4fc207f", 900),
  พลัส: unsplash("1559602580-78f1ba809b92", 900),
};
export const FALLBACK_PACKAGE_IMAGE = unsplash("1769865399483-1af590633176", 900);

export const GALLERY = [
  { src: unsplash("1699730148132-1409a3728479", 800), alt: "กลุ่มเพื่อนนั่งทานอาหารรอบโต๊ะ" },
  { src: unsplash("1703945530505-2f06e3e1cf97", 800), alt: "หม้อสุกี้สองช่องพร้อมวัตถุดิบ" },
  { src: unsplash("1723744909898-4a1ce8922699", 800), alt: "โต๊ะอาหารที่มีเพื่อนชนแก้ว" },
  { src: unsplash("1769865399483-1af590633176", 800), alt: "โต๊ะที่เต็มไปด้วยวัตถุดิบสำหรับหม้อไฟ" },
  { src: unsplash("1681657687044-9bde75edb38e", 800), alt: "ครอบครัวทานอาหารร่วมกัน" },
  { src: unsplash("1648977555545-4dd006e30d3f", 800), alt: "หม้อสุกี้เนื้อและผัก" },
] as const;

/** Not in the provided files → empty url = section hidden. */
export const DELIVERY: { name: string; url: string }[] = [
  { name: "GrabFood", url: "" },
  { name: "LINE MAN", url: "" },
  { name: "foodpanda", url: "" },
];

/** Per-branch extras (phone/floor/parking) are not in the files → empty = hidden. */
export const BRANCH_INFO: Record<string, { phone?: string; floor?: string; parking?: string }> = {};

export const mapsUrl = (branch: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`สุกี้ตี๋ใหญ่ ${branch}`)}`;
