"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SectionCard } from "@/features/dashboard/ui";
import { updateSellerProfile } from "@/features/dashboard/actions";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";
const TYPES = ["Dealership", "Used Parts Dealer", "Workshop", "Individual"];

export function SellerProfileForm({
  live,
  initial,
}: {
  live: boolean;
  initial: { name: string; businessType: string; location: string };
}) {
  const [name, setName] = useState(initial.name);
  const [businessType, setBusinessType] = useState(initial.businessType || "Dealership");
  const [location, setLocation] = useState(initial.location);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (live) await updateSellerProfile({ name, businessType, location });
    setBusy(false);
    setSaved(true);
  };

  return (
    <SectionCard title="Business details">
      <form onSubmit={save} className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Business name</label>
          <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} className={field} />
        </div>
        <div>
          <label className={labelCls}>Business type</label>
          <select value={businessType} onChange={(e) => { setBusinessType(e.target.value); setSaved(false); }} className={field}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input value={location} onChange={(e) => { setLocation(e.target.value); setSaved(false); }} className={field} />
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
