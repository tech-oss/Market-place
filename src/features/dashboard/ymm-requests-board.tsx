"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { SectionCard } from "@/features/dashboard/ui";
import { approveYmmRequest, rejectYmmRequest } from "@/features/dashboard/actions";
import type { YmmRequestView } from "@/lib/data/dashboard";

export function YmmRequestsBoard({ initial, live }: { initial: YmmRequestView[]; live: boolean }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const approve = async (id: string) => {
    setBusy(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (live) {
      const res = await approveYmmRequest(id);
      if (res.ok && !res.fellBack) router.refresh();
    }
    setBusy(null);
  };

  const reject = async (id: string) => {
    const note = window.prompt("Optional note for why this is being rejected (kept for internal reference):") ?? undefined;
    setBusy(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (live) {
      const res = await rejectYmmRequest(id, note);
      if (res.ok && !res.fellBack) router.refresh();
    }
    setBusy(null);
  };

  if (requests.length === 0) {
    return (
      <SectionCard>
        <p className="p-8 text-center text-sm text-muted-foreground">
          No pending make/model/year requests.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <SectionCard key={r.id}>
          <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="font-bold text-foreground">
                {r.makeName} {r.modelName}{" "}
                <span className="font-normal text-muted-foreground">({r.yearFrom}–{r.yearTo})</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Requested by {r.sellerName} for{" "}
                <Link href={`/admin/listings/${r.productId}`} className="font-medium text-foreground hover:text-brand">
                  {r.productTitle}
                </Link>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => approve(r.id)}
                disabled={busy === r.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
              >
                <Check className="size-4" /> Approve
              </button>
              <button
                onClick={() => reject(r.id)}
                disabled={busy === r.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
              >
                <X className="size-4" /> Reject
              </button>
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
