"use client";

import { useState } from "react";
import { Check, FileText, MapPin, X } from "lucide-react";
import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { sellerApplications as seed } from "@/mocks/dashboard";
import type { SellerApplication, SellerStatus } from "@/types";

const STATUS_TONE: Record<SellerStatus, "amber" | "green" | "red" | "gray"> = {
  pending: "amber",
  active: "green",
  rejected: "red",
  suspended: "gray",
};
const STATUS_LABEL: Record<SellerStatus, string> = {
  pending: "Pending",
  active: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

function DocPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
      <FileText className="size-3" /> {label} {ok ? "✓" : "✗"}
    </span>
  );
}

export default function AdminSellersPage() {
  const [apps, setApps] = useState<SellerApplication[]>(seed);

  const setStatus = (id: string, status: SellerStatus) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const pendingCount = apps.filter((a) => a.status === "pending").length;

  return (
    <>
      <PageHeading
        title="Seller Approvals"
        description={`${pendingCount} application${pendingCount === 1 ? "" : "s"} awaiting review.`}
      />

      <div className="space-y-4">
        {apps.map((a) => (
          <SectionCard key={a.id}>
            <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{a.businessName}</h3>
                  <StatusPill label={STATUS_LABEL[a.status]} tone={STATUS_TONE[a.status]} />
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{a.businessType}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {a.ownerName} · {a.email}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {a.location}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <DocPill ok={a.idDocUploaded} label="ID Document" />
                  <DocPill ok={a.proofOfResidenceUploaded} label="Proof of Residence" />
                </div>
              </div>

              {a.status === "pending" ? (
                <div className="flex shrink-0 gap-3">
                  <button
                    onClick={() => setStatus(a.id, "active")}
                    disabled={!a.idDocUploaded || !a.proofOfResidenceUploaded}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    title={!a.idDocUploaded || !a.proofOfResidenceUploaded ? "All documents required to approve" : undefined}
                  >
                    <Check className="size-4" /> Approve
                  </button>
                  <button
                    onClick={() => setStatus(a.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-input px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <X className="size-4" /> Reject
                  </button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {a.status === "active" ? "Live on marketplace" : "No action needed"}
                </span>
              )}
            </div>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
