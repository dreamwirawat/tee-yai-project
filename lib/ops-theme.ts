/**
 * Light/dark theme for the /ops back office only.
 *
 * The theme lives on <html data-ops-theme="light|dark"> so portals (popover, select,
 * sheet, dialog) inherit it too. The storefront never has the attribute, so it keeps
 * the cream brand theme.
 *
 * - Hard loads of /ops: OPS_THEME_BOOT_SCRIPT (inline in <head>) sets it before paint.
 * - Soft navigations: <OpsThemeController> sets it on mount and removes it on unmount.
 */
export type OpsTheme = "light" | "dark";

export const OPS_THEME_KEY = "ops-theme";
export const OPS_THEME_ATTR = "data-ops-theme";

export const OPS_THEME_BOOT_SCRIPT = `(function(){try{if(location.pathname.indexOf("/ops")!==0)return;var t=localStorage.getItem("${OPS_THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("${OPS_THEME_ATTR}",t)}catch(e){}})()`;

export function readStoredOpsTheme(): OpsTheme {
  try {
    const t = localStorage.getItem(OPS_THEME_KEY);
    if (t === "light" || t === "dark") return t;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}
