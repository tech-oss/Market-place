"use client";

import { useState } from "react";
import { Check, Percent } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { SectionCard } from "@/features/dashboard/ui";
import { updateCommission } from "@/features/dashboard/actions";

const SAMPLE = 210000;

export function CommissionForm({ initialPct, live }: { initialPct: number; live: boolean }) {
  const [pct, setPct] = useState(initialPct);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const commission = Math.round(SAMPLE * (pct / 100));
  const payout = SAMPLE - commission;

  const save = async () => {
    setBusy(true);
    if (live) await updateCommission(pct);
    setBusy(false);
    setSaved(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Commission rate">
        <div className="p-5">
          <label className="mb-1 block text-xs font-semibold text-foreground">Flat commission (%)</label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number" min={0} max={30} step={0.5} value={pct}
                onChange={(e) => { setPct(Number(e.target.value)); setSaved(false); }}
                className="w-32 rounded-lg border border-input py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
            <button
              onClick={save} disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saved && !busy ? <Check className="size-4" /> : null} {busy ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Applied to every completed sale before funds are released from escrow to the seller&rsquo;s wallet.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Fee preview">
        <div className="space-y-3 p-5 text-sm">
          <p className="text-muted-foreground">Example on a {formatZAR(SAMPLE)} sale:</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Sale price</span><span className="font-medium text-foreground">{formatZAR(SAMPLE)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Platform commission ({pct}%)</span><span className="font-medium text-red-600">−{formatZAR(commission)}</span></div>
          <div className="flex justify-between border-t border-border pt-3"><span className="font-semibold text-foreground">Seller receives</span><span className="text-lg font-black text-emerald-600">{formatZAR(payout)}</span></div>
        </div>
      </SectionCard>
    </div>
  );
}
