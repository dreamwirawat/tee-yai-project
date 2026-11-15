"use client";

/**
 * Inline script that runs once during HTML parsing (before first paint).
 * Must be a Client Component so the `typeof window` branch is evaluated in the
 * browser too (from a Server Component the client would still see text/javascript).
 *
 * Per the Next 16 "preventing flash before hydration" guide: render it as
 * text/javascript on the server and text/plain on the client, so React does not
 * warn about rendering a <script> tag. suppressHydrationWarning covers the
 * type mismatch.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
