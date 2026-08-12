"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Clock, FileUp, Loader2, X } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { submitPaymentProof } from "@/features/cart/actions";
import { createClient } from "@/lib/supabase/client";
import type { PaymentSettings } from "@/lib/data/dashboard";

const ACCEPTED = ".jpg,.jpeg,.png,.pdf";
const ACCEPTED_MIME = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function EftPaymentPopup({
  orderId,
  reference,
  totalCents,
  deadline,
  settings,
  onClose,
}: {
  orderId: string;
  reference: string;
  totalCents: number;
  deadline?: string;
  settings: PaymentSettings;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })
    : null;

  const upload = async (file: File) => {
    setError(null);
    if (!ACCEPTED_MIME.includes(file.type)) {
      setError("Please upload a JPG, JPEG, PNG or PDF file.");
      return;
    }
    const supabase = createClient();
    if (!supabase) { setError("File storage isn't connected."); return; }
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); setError("Please sign in again."); return; }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${orderId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(path, file, { upsert: true });
    if (uploadError) { setError(uploadError.message); setUploading(false); return; }

    const res = await submitPaymentProof(orderId, path);
    setUploading(false);
    if (!res.ok) { setError(res.error ?? "Something went wrong. Please try again."); return; }
    setSubmitted(true);
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Building2 className="size-5 text-brand" /> Pay by EFT
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-4 text-center">
            <p className="font-semibold text-foreground">Proof submitted</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&rsquo;ve received your payment proof for order {reference}. We&rsquo;ll confirm it shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Order <strong className="text-foreground">{reference}</strong> · Transfer{" "}
              <strong className="text-foreground">{formatZAR(totalCents)}</strong> using the details below.
            </p>

            {deadlineLabel && (
              <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                <Clock className="size-3.5 shrink-0" /> Complete payment by {deadlineLabel}, or this order is cancelled automatically.
              </p>
            )}

            <div className="mt-4 rounded-xl border border-border bg-neutral-50 p-4">
              <DetailRow label="Bank" value={settings.bankName} />
              <DetailRow label="Account title" value={settings.accountTitle} />
              <DetailRow label="Account number" value={settings.accountNumber} />
              <DetailRow label="Branch code" value={settings.branchCode} />
              <DetailRow label="IBAN / other" value={settings.iban} />
              {!settings.bankName && !settings.accountNumber && (
                <p className="text-sm text-muted-foreground">
                  Bank details haven&rsquo;t been set up yet — check back shortly or contact support.
                </p>
              )}
            </div>

            {settings.eftInstructions && (
              <p className="mt-3 whitespace-pre-line text-xs text-muted-foreground">{settings.eftInstructions}</p>
            )}

            <label className="mt-4 block text-xs font-semibold text-foreground">
              Upload proof of payment (JPG, JPEG, PNG or PDF)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-input px-3 py-3 text-sm font-medium text-muted-foreground hover:border-brand hover:text-brand disabled:opacity-60"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
              {uploading ? "Uploading…" : "Complete Payment — upload proof"}
            </button>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Skip / Pay Later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
