"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { updateBuyerProfile } from "@/features/account/actions";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const fieldDisabled = "w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

export function BuyerProfileForm({
  initial,
}: {
  initial: { fullName: string; email: string; phone: string };
}) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await updateBuyerProfile({ fullName, phone });
    setBusy(false);
    setSaved(true);
  };

  return (
    <form onSubmit={save} className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
      <div>
        <label className={labelCls}>Full name</label>
        <input required value={fullName} onChange={(e) => { setFullName(e.target.value); setSaved(false); }} className={field} />
      </div>
      <div>
        <label className={labelCls}>Phone number</label>
        <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setSaved(false); }} placeholder="082 000 0000" className={field} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Email</label>
        <input value={initial.email} disabled className={fieldDisabled} />
        <p className="mt-1 text-[11px] text-muted-foreground">Your email is tied to your login and can&rsquo;t be changed here.</p>
      </div>
      <div className="sm:col-span-2">
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
          {saved && !busy ? <Check className="size-4" /> : null} {busy ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
