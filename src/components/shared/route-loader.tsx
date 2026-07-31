"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/shared/page-loader";

/**
 * Shows the branded PageLoader while a route transition is in flight.
 *
 * Next's own loading.tsx/Suspense-reveal mechanism hangs indefinitely in this
 * project's dev setup (reproduced with a bare-bones loading.tsx — the
 * boundary never swaps back to real content), so instead of relying on that
 * we drive the loader from real browser navigation signals: show it the
 * moment an internal link is clicked (or back/forward is used), hide it the
 * moment the committed route actually changes. A timeout is a last-resort
 * safety net so a loader can never get stuck open.
 */
export function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const key = `${pathname}?${searchParams?.toString() ?? ""}`;
  const prevKey = useRef(key);

  useEffect(() => {
    if (prevKey.current !== key) {
      prevKey.current = key;
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (anchor.origin !== window.location.origin) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.pathname + anchor.search === window.location.pathname + window.location.search) return;
      setLoading(true);
    }
    function onPopState() {
      setLoading(true);
    }
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const safety = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(safety);
  }, [loading]);

  if (!loading) return null;
  return <PageLoader />;
}
