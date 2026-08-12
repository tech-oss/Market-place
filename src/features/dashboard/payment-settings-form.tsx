"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SectionCard } from "@/features/dashboard/ui";
import { updatePaymentSettings } from "@/features/dashboard/actions";
import type { PaymentSettings } from "@/lib/data/dashboard";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

export function PaymentSettingsForm({ initial, live }: { initial: PaymentSettings; live: boolean }) {
  const [onlineEnabled, setOnlineEnabled] = useState(initial.onlineEnabled);
  const [eftEnabled, setEftEnabled] = useState(initial.eftEnabled);
  const [bankName, setBankName] = useState(initial.bankName);
  const [accountTitle, setAccountTitle] = useState(initial.accountTitle);
  const [accountNumber, setAccountNumber] = useState(initial.accountNumber);
  const [branchCode, setBranchCode] = useState(initial.branchCode);
  const [iban, setIban] = useState(initial.iban);
  const [eftInstructions, setEftInstructions] = useState(initial.eftInstructions);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const touch = () => setSaved(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (live) {
      await updatePaymentSettings({
        onlineEnabled, eftEnabled, bankName, accountTitle, accountNumber, branchCode, iban, eftInstructions,
      });
    }
    setBusy(false);
    setSaved(true);
  };

  return (
    <SectionCard title="Payment Method Configuration">
      <form onSubmit={save} className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-xl border border-border p-3.5 text-sm">
            <input type="checkbox" className="mt-0.5" checked={onlineEnabled} onChange={(e) => { setOnlineEnabled(e.target.checked); touch(); }} />
            <span>
              <span className="block font-semibold text-foreground">Online Payment</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Existing flow — order confirms and funds are held immediately.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-border p-3.5 text-sm">
            <input type="checkbox" className="mt-0.5" checked={eftEnabled} onChange={(e) => { setEftEnabled(e.target.checked); touch(); }} />
            <span>
              <span className="block font-semibold text-foreground">EFT</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Buyer transfers manually; you confirm payment before the seller ships.</span>
            </span>
          </label>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-semibold text-foreground">EFT bank details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Bank name</label>
              <input value={bankName} onChange={(e) => { setBankName(e.target.value); touch(); }} placeholder="e.g. FNB" className={field} />
            </div>
            <div>
              <label className={labelCls}>Account title</label>
              <input value={accountTitle} onChange={(e) => { setAccountTitle(e.target.value); touch(); }} placeholder="Account holder name" className={field} />
            </div>
            <div>
              <label className={labelCls}>Account number</label>
              <input value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value); touch(); }} className={field} />
            </div>
            <div>
              <label className={labelCls}>Branch code</label>
              <input value={branchCode} onChange={(e) => { setBranchCode(e.target.value); touch(); }} className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>IBAN / other transfer details <span className="font-normal text-muted-foreground">— optional</span></label>
              <input value={iban} onChange={(e) => { setIban(e.target.value); touch(); }} className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Payment instructions shown to buyers <span className="font-normal text-muted-foreground">— optional</span></label>
              <textarea
                rows={3}
                value={eftInstructions}
                onChange={(e) => { setEftInstructions(e.target.value); touch(); }}
                placeholder="e.g. Use your order reference as the payment description."
                className={`${field} resize-none`}
              />
            </div>
          </div>
        </div>

        <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
          {saved && !busy ? <Check className="size-4" /> : null} {busy ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </SectionCard>
  );
}
