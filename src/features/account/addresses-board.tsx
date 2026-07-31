"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { createAddress, deleteAddress, setDefaultAddress, updateAddress, type AddressInput } from "@/features/account/actions";
import { EmptyState } from "@/components/shared/empty-state";
import type { BuyerAddress } from "@/lib/data/account";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

function AddressForm({
  initial,
  onCancel,
  onSubmit,
  busy,
}: {
  initial?: BuyerAddress;
  onCancel: () => void;
  onSubmit: (input: AddressInput) => void;
  busy: boolean;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ label: label.trim() || undefined, fullName, phone, addressLine, city, postalCode, isDefault });
      }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Label <span className="font-normal text-muted-foreground">— optional, e.g. Home, Work</span></label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={field} />
        </div>
        <div>
          <label className={labelCls}>Full name</label>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} />
        </div>
        <div>
          <label className={labelCls}>Phone number</label>
          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Street address</label>
          <input required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className={field} />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input required value={city} onChange={(e) => setCity(e.target.value)} className={field} />
        </div>
        <div>
          <label className={labelCls}>Postal code</label>
          <input required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={field} />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="accent-brand" />
          Set as default delivery address
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
          {busy ? "Saving…" : "Save address"}
        </button>
      </div>
    </form>
  );
}

export function AddressesBoard({ initial }: { initial: BuyerAddress[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const editing = addresses.find((a) => a.id === editingId);

  const add = async (input: AddressInput) => {
    setBusy(true);
    const res = await createAddress(input);
    setBusy(false);
    setAdding(false);
    if (res.ok && !res.fellBack) router.refresh();
  };

  const save = async (input: AddressInput) => {
    if (!editingId) return;
    setBusy(true);
    const res = await updateAddress(editingId, input);
    setBusy(false);
    setEditingId(null);
    if (res.ok && !res.fellBack) router.refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    const res = await deleteAddress(id);
    if (res.ok && !res.fellBack) router.refresh();
  };

  const makeDefault = async (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    const res = await setDefaultAddress(id);
    if (res.ok && !res.fellBack) router.refresh();
  };

  return (
    <div className="space-y-4">
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> Add address
        </button>
      )}

      {adding && <AddressForm busy={busy} onCancel={() => setAdding(false)} onSubmit={add} />}

      {addresses.length === 0 && !adding ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add a delivery address so checkout is faster next time."
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((a) =>
            editing?.id === a.id ? (
              <AddressForm key={a.id} initial={a} busy={busy} onCancel={() => setEditingId(null)} onSubmit={save} />
            ) : (
              <div key={a.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{a.label || "Address"}</p>
                      {a.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                          <Star className="size-3 fill-brand" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{a.fullName} · {a.phone}</p>
                    <p className="text-sm text-muted-foreground">{a.addressLine}, {a.city} {a.postalCode}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(a.id)} className="inline-flex items-center gap-1 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                      <Pencil className="size-3.5" /> Edit
                    </button>
                    <button onClick={() => remove(a.id)} className="inline-flex items-center gap-1 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      <Trash2 className="size-3.5" /> Delete
                    </button>
                  </div>
                  {!a.isDefault && (
                    <button onClick={() => makeDefault(a.id)} className="text-xs font-medium text-brand hover:underline">
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
