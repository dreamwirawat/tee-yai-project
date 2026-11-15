import type { Metadata } from "next";
import { Kanit, Prompt } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { OPS_THEME_BOOT_SCRIPT } from "@/lib/ops-theme";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in production so OG image URLs are absolute and correct.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "สุกี้ตี๋ใหญ่ | อร่อยเต็มหม้อ",
  description: "สุกี้ตี๋ใหญ่ 7 สาขา แพ็กเกจ 279 และ 359 NET",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      data-scroll-behavior="smooth"
      className={`${prompt.variable} ${kanit.variable} h-full antialiased`}
      // the boot script may add data-ops-theme before hydration
      suppressHydrationWarning
    >
      <head>
        {/* Sets the /ops light/dark theme before first paint (no flash). See lib/ops-theme.ts */}
        <script dangerouslySetInnerHTML={{ __html: OPS_THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
