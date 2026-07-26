"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { requestPayout } from "@/features/dashboard/actions";

export function PayoutButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={disabled || pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await requestPayout();
            if (!res.ok) setError(res.error ?? "Something went wrong.");
            else router.refresh();
          });
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowDownToLine className="size-4" />}
        Request payout
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
