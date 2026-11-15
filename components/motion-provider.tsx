"use client";

import { MotionConfig } from "motion/react";

/** Makes every `motion` animation (BlurFade etc.) honour prefers-reduced-motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
