"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPS_THEME_ATTR, OPS_THEME_KEY, readStoredOpsTheme, type OpsTheme } from "@/lib/ops-theme";

const EVENT = "ops-theme-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
const getSnapshot = (): OpsTheme =>
  document.documentElement.getAttribute(OPS_THEME_ATTR) === "dark" ? "dark" : "light";
const getServerSnapshot = (): OpsTheme => "light";

function apply(theme: OpsTheme | null) {
  const el = document.documentElement;
  if (theme) el.setAttribute(OPS_THEME_ATTR, theme);
  else el.removeAttribute(OPS_THEME_ATTR);
  window.dispatchEvent(new Event(EVENT));
}

/** Applies the stored theme while /ops is mounted; removes it when leaving /ops. */
export function OpsThemeController() {
  useLayoutEffect(() => {
    apply(readStoredOpsTheme());
    return () => apply(null);
  }, []);
  return null;
}

export function OpsThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next: OpsTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={next === "dark" ? "เปลี่ยนเป็นโหมดมืด" : "เปลี่ยนเป็นโหมดสว่าง"}
      title={next === "dark" ? "โหมดมืด" : "โหมดสว่าง"}
      onClick={() => {
        try {
          localStorage.setItem(OPS_THEME_KEY, next);
        } catch {
          /* storage unavailable — theme still switches for this visit */
        }
        apply(next);
      }}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
