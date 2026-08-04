"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyTrackingButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — silently no-op, the number is still visible to copy manually.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy tracking number"
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      <span className="text-[11px] font-medium">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
