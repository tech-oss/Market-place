"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Animated number that counts up when scrolled into view.
 * Preserves any prefix/suffix (e.g. "14,280+", "98.9%").
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : "0");

  // Parse the numeric core out of the string, keeping prefix/suffix.
  const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/);

  useEffect(() => {
    if (!inView || reduce || !match) {
      if (!match) setDisplay(value);
      return;
    }
    const [, prefix, num, suffix] = match;
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const target = parseFloat(num.replace(/,/g, ""));
    const duration = 1200;
    const start = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = target * eased;
      const formatted =
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString("en-US");
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value, match]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
