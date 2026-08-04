"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SectionCard } from "@/features/dashboard/ui";
import { updatePlatformSettings } from "@/features/dashboard/actions";
import type { PlatformSettings } from "@/lib/data/dashboard";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

export function ReturnSettingsForm({ initial, live }: { initial: PlatformSettings; live: boolean }) {
  const [returnAddress, setReturnAddress] = useState(initial.returnAddress);
  const [returnContactName, setReturnContactName] = useState(initial.returnContactName);
  const [returnContactPhone, setReturnContactPhone] = useState(initial.returnContactPhone);
  const [returnWindowDays, setReturnWindowDays] = useState(String(initial.returnWindowDays));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const touch = () => setSaved(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (live) {
      await updatePlatformSettings({
        returnAddress,
        returnContactName,
        returnContactPhone,
        returnWindowDays: Math.max(1, Number(returnWindowDays) || 5),
      });
    }
    setBusy(false);
    setSaved(true);
  };

  return (
    <SectionCard title="Returns">
      <form onSubmit={save} className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Return address</label>
          <textarea
            rows={3}
            value={returnAddress}
            onChange={(e) => { setReturnAddress(e.target.value); touch(); }}
            placeholder={"Unit 4, 12 Main Road\nMidrand, Gauteng 1685"}
            className={`${field} resize-none`}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Shown to buyers when they start a return — this is where they ship the part back to.
          </p>
        </div>
        <div>
          <label className={labelCls}>Contact name</label>
          <input value={returnContactName} onChange={(e) => { setReturnContactName(e.target.value); touch(); }} placeholder="Returns Desk" className={field} />
        </div>
        <div>
          <label className={labelCls}>Contact phone</label>
          <input value={returnContactPhone} onChange={(e) => { setReturnContactPhone(e.target.value); touch(); }} placeholder="011 000 0000" className={field} />
        </div>
        <div>
          <label className={labelCls}>Return / release window (days)</label>
          <input
            type="number"
            min="1"
            value={returnWindowDays}
            onChange={(e) => { setReturnWindowDays(e.target.value); touch(); }}
            className={field}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            How long a buyer has to return after confirming delivery. Once it elapses, the order is
            flagged on your dashboard as ready for a payment-release decision.
          </p>
        </div>
        <div className="sm:col-span-2">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
            {saved && !busy ? <Check className="size-4" /> : null} {busy ? "Saving…" : saved ? "Saved" : "Save changes"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
