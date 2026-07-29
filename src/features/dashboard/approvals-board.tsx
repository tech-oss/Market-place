"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, FileText, MapPin, ShieldAlert, X } from "lucide-react";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { getKycSignedUrl, setSellerStatus } from "@/features/dashboard/actions";
import type { SellerApplication, SellerStatus } from "@/types";

const STATUS_TONE: Record<SellerStatus, "amber" | "green" | "red" | "gray"> = {
  pending: "amber", active: "green", rejected: "red", suspended: "gray",
};

/** Human status label — approved sellers show *how* they were approved. */
function statusLabel(a: SellerApplication): string {
  if (a.status === "active") {
    return a.approvalType === "admin_override"
      ? "Approved without docs"
      : "Approved after doc verification";
  }
  return { pending: "Pending", rejected: "Rejected", suspended: "Suspended" }[a.status] ?? a.status;
}

const SELLER_TYPE_LABEL: Record<string, string> = {
  individual: "Individual Seller",
  parts_dealer: "Parts Dealer",
  accessories_dealer: "Accessories Dealer",
};

function DocPill({ ok, label, path }: { ok: boolean; label: string; path?: string | null }) {
  const view = async () => {
    if (!path) return;
    const res = await getKycSignedUrl(path);
    if (res.url) window.open(res.url, "_blank", "noopener");
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
      <FileText className="size-3" /> {label} {ok ? "✓" : "✗"}
      {ok && path && path !== "demo" && (
        <button type="button" onClick={view} className="ml-0.5 inline-flex items-center hover:underline" title="View document">
          <ExternalLink className="size-3" />
        </button>
      )}
    </span>
  );
}

export function ApprovalsBoard({ initial, live }: { initial: SellerApplication[]; live: boolean }) {
  const router = useRouter();
  const [apps, setApps] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (
    id: string,
    status: "active" | "rejected",
    approvalType?: "docs_verified" | "admin_override",
  ) => {
    // optimistic
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, approvalType: status === "active" ? (approvalType ?? "docs_verified") : null } : a)),
    );
    if (live) {
      setBusy(id);
      const res = await setSellerStatus(id, status, approvalType);
      setBusy(null);
      if (res.ok && !res.fellBack) router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {apps.map((a) => {
        const allDocs = a.idDocUploaded && a.proofOfResidenceUploaded && a.proofOfBankingUploaded;
        return (
          <SectionCard key={a.id}>
            <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{a.businessName}</h3>
                  <StatusPill label={statusLabel(a)} tone={STATUS_TONE[a.status]} />
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                    {SELLER_TYPE_LABEL[a.sellerType] ?? a.businessType}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.ownerName} · {a.email}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {a.location}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <DocPill ok={a.idDocUploaded} label="ID Document" path={a.idDocPath} />
                  <DocPill ok={a.proofOfResidenceUploaded} label="Proof of Residence" path={a.proofPath} />
                  <DocPill ok={a.proofOfBankingUploaded} label="Proof of Banking" path={a.bankingPath} />
                </div>
              </div>

              {a.status === "pending" ? (
                <div className="flex shrink-0 flex-col items-stretch gap-2 lg:items-end">
                  <div className="flex gap-3">
                    <button
                      onClick={() => decide(a.id, "active", "docs_verified")}
                      disabled={busy === a.id || !allDocs}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      title={!allDocs ? "All three documents required for a verified approval" : undefined}
                    >
                      <Check className="size-4" /> Approve
                    </button>
                    <button
                      onClick={() => decide(a.id, "rejected")}
                      disabled={busy === a.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-input px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                      <X className="size-4" /> Reject
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Approve this seller WITHOUT document verification? Use only for sellers you trust.")) {
                        decide(a.id, "active", "admin_override");
                      }
                    }}
                    disabled={busy === a.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                    title="Bypass document verification for a trusted seller"
                  >
                    <ShieldAlert className="size-3.5" /> Approve without docs
                  </button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {a.status === "active" ? "Live on marketplace" : "No action needed"}
                </span>
              )}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
