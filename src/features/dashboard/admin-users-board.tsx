"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, MoreVertical, RotateCcw, Trash2 } from "lucide-react";
import { StatusPill } from "@/features/dashboard/ui";
import {
  deleteSellerPermanently,
  setSellerStatus,
  setSellerType,
} from "@/features/dashboard/actions";
import type { AdminUserView } from "@/lib/data/dashboard";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "gray" | "indigo"> = {
  active: "green",
  pending: "amber",
  rejected: "red",
  suspended: "gray",
};

const SELLER_TYPES = [
  { value: "individual", label: "Individual Seller" },
  { value: "parts_dealer", label: "Parts Dealer" },
  { value: "accessories_dealer", label: "Accessories Dealer" },
] as const;

export function AdminUsersBoard({ initial, live }: { initial: AdminUserView[]; live: boolean }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);

  const refresh = (res: { ok: boolean; fellBack?: boolean }) => {
    if (res.ok && !res.fellBack) router.refresh();
  };

  const changeStatus = async (sellerId: string, status: "active" | "suspended") => {
    setBusy(sellerId);
    setRows((prev) => prev.map((r) => (r.sellerId === sellerId ? { ...r, status } : r)));
    if (live) refresh(await setSellerStatus(sellerId, status, "docs_verified"));
    setBusy(null);
    setMenu(null);
  };

  const changeType = async (sellerId: string, sellerType: string) => {
    setBusy(sellerId);
    setRows((prev) => prev.map((r) => (r.sellerId === sellerId ? { ...r, sellerType } : r)));
    if (live) {
      await setSellerType(sellerId, sellerType as "individual" | "parts_dealer" | "accessories_dealer");
    }
    setBusy(null);
  };

  const remove = async (sellerId: string) => {
    if (!window.confirm("Permanently delete this seller and wipe ALL their data (listings, wallet)? This cannot be undone.")) {
      return;
    }
    setBusy(sellerId);
    if (live) {
      const res = await deleteSellerPermanently(sellerId);
      if (res.ok && !res.fellBack) {
        setRows((prev) => prev.filter((r) => r.sellerId !== sellerId));
        router.refresh();
      }
    } else {
      setRows((prev) => prev.filter((r) => r.sellerId !== sellerId));
    }
    setBusy(null);
    setMenu(null);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Seller type</th>
            <th className="px-5 py-3 font-medium">Joined</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 && (
            <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">No users yet.</td></tr>
          )}
          {rows.map((u) => {
            const isSeller = u.role === "seller" && !!u.sellerId;
            return (
              <tr key={u.id} className="hover:bg-neutral-50">
                <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3">
                  <StatusPill label={u.role} tone={u.role === "seller" ? "indigo" : "gray"} />
                </td>
                <td className="px-5 py-3">
                  {isSeller ? (
                    <select
                      value={u.sellerType ?? "individual"}
                      disabled={busy === u.sellerId}
                      onChange={(e) => changeType(u.sellerId!, e.target.value)}
                      className="rounded-lg border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                      {SELLER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {new Date(u.joined).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td className="px-5 py-3">
                  <StatusPill label={u.status} tone={STATUS_TONE[u.status] ?? "gray"} />
                </td>
                <td className="px-5 py-3">
                  {isSeller ? (
                    <div className="relative flex justify-end">
                      <button
                        type="button"
                        aria-label="Seller actions"
                        onClick={() => setMenu(menu === u.sellerId ? null : u.sellerId!)}
                        className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {menu === u.sellerId && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                          <div className="absolute right-0 top-9 z-20 w-52 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
                            {u.status === "suspended" ? (
                              <button
                                onClick={() => changeStatus(u.sellerId!, "active")}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted"
                              >
                                <RotateCcw className="size-4 text-emerald-600" /> Reactivate seller
                              </button>
                            ) : (
                              <button
                                onClick={() => changeStatus(u.sellerId!, "suspended")}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted"
                              >
                                <Ban className="size-4 text-amber-600" /> Suspend seller
                              </button>
                            )}
                            <button
                              onClick={() => remove(u.sellerId!)}
                              className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-4" /> Delete permanently
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="block text-right text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
