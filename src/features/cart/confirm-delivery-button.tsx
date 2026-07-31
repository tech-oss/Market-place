"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { confirmDelivery } from "@/features/cart/actions";

export function ConfirmDeliveryButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const confirm = async () => {
    if (!window.confirm("Confirm you've received this part? This releases payment to the seller.")) return;
    setBusy(true);
    setError(null);
    const res = await confirmDelivery(orderId);
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Something went wrong. Please try again."); return; }
    setDone(true);
    router.refresh();
  };

  if (done) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        <CheckCircle2 className="size-4" /> Thanks — payment has been released to the seller.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={confirm}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        Mark as received
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
