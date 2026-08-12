"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { EftPaymentPopup } from "@/features/cart/eft-payment-popup";
import type { PaymentSettings } from "@/lib/data/dashboard";

export function DoTransferButton({
  orderId,
  reference,
  totalCents,
  deadline,
  settings,
  className,
}: {
  orderId: string;
  reference: string;
  totalCents: number;
  deadline?: string;
  settings: PaymentSettings;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className={className ?? "inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90"}
      >
        <Banknote className="size-3.5" /> Do the Transfer Now
      </button>
      {open && (
        <EftPaymentPopup
          orderId={orderId}
          reference={reference}
          totalCents={totalCents}
          deadline={deadline}
          settings={settings}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
