"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import {
  createBikeMake,
  createBikeModel,
  deleteBikeMake,
  deleteBikeModel,
  updateBikeMake,
  updateBikeModel,
} from "@/features/dashboard/actions";
import type { BikeMake, BikeModel } from "@/lib/data/products";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";

export function BikeCatalogBoard({
  initialMakes,
  initialModels,
  live,
}: {
  initialMakes: BikeMake[];
  initialModels: BikeModel[];
  live: boolean;
}) {
  const router = useRouter();
  const [makes, setMakes] = useState(initialMakes);
  const [models, setModels] = useState(initialModels);
  const [busy, setBusy] = useState<string | null>(null);
  const [newMake, setNewMake] = useState("");

  const [modelMakeId, setModelMakeId] = useState(initialMakes[0]?.id ?? "");
  const [modelName, setModelName] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const refresh = (res: { ok: boolean; fellBack?: boolean }) => {
    if (res.ok && !res.fellBack) router.refresh();
  };

  const addMake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMake.trim()) return;
    setBusy("new-make");
    if (live) refresh(await createBikeMake(newMake.trim()));
    setBusy(null);
    setNewMake("");
  };

  const renameMake = async (m: BikeMake) => {
    const name = window.prompt("Rename make", m.name);
    if (!name || !name.trim() || name.trim() === m.name) return;
    setBusy(m.id);
    setMakes((prev) => prev.map((x) => (x.id === m.id ? { ...x, name: name.trim() } : x)));
    if (live) refresh(await updateBikeMake(m.id, name.trim()));
    setBusy(null);
  };

  const removeMake = async (m: BikeMake) => {
    if (!window.confirm(`Delete "${m.name}" and every model under it? This can't be undone.`)) return;
    setBusy(m.id);
    setMakes((prev) => prev.filter((x) => x.id !== m.id));
    setModels((prev) => prev.filter((x) => x.makeId !== m.id));
    if (live) refresh(await deleteBikeMake(m.id));
    setBusy(null);
  };

  const addModel = async (e: React.FormEvent) => {
    e.preventDefault();
    const make = makes.find((m) => m.id === modelMakeId);
    const yf = parseInt(yearFrom, 10);
    const yt = parseInt(yearTo, 10);
    if (!make || !modelName.trim() || !Number.isFinite(yf) || !Number.isFinite(yt)) return;
    setBusy("new-model");
    if (live) refresh(await createBikeModel({ makeId: make.id, name: modelName.trim(), yearFrom: yf, yearTo: yt }));
    setBusy(null);
    setModelName("");
    setYearFrom("");
    setYearTo("");
  };

  const renameModel = async (m: BikeModel) => {
    const name = window.prompt("Rename model", m.name);
    if (!name || !name.trim()) return;
    const range = window.prompt("Year range (from-to)", `${m.yearFrom}-${m.yearTo}`);
    const [yf, yt] = (range ?? "").split(/[–-]/).map((y) => parseInt(y.trim(), 10));
    const patch = {
      name: name.trim(),
      yearFrom: Number.isFinite(yf) ? yf : m.yearFrom,
      yearTo: Number.isFinite(yt) ? yt : m.yearTo,
    };
    setBusy(m.id);
    setModels((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...patch } : x)));
    if (live) refresh(await updateBikeModel(m.id, patch));
    setBusy(null);
  };

  const toggleModelStatus = async (m: BikeModel) => {
    const status = m.status === "active" ? "inactive" : "active";
    setBusy(m.id);
    setModels((prev) => prev.map((x) => (x.id === m.id ? { ...x, status } : x)));
    if (live) refresh(await updateBikeModel(m.id, { status }));
    setBusy(null);
  };

  const removeModel = async (m: BikeModel) => {
    if (!window.confirm(`Delete "${m.name}"? Existing listings keep their fitment text but sellers won't be able to pick it again.`)) return;
    setBusy(m.id);
    setModels((prev) => prev.filter((x) => x.id !== m.id));
    if (live) refresh(await deleteBikeModel(m.id));
    setBusy(null);
  };

  return (
    <div className="space-y-8">
      <SectionCard title="Makes">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Make</th>
                <th className="px-5 py-3 font-medium">Active listings</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {makes.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No makes yet.</td></tr>
              )}
              {makes.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-foreground">{m.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.partCount}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => renameMake(m)} disabled={busy === m.id} className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                        <Pencil className="size-3.5" /> Rename
                      </button>
                      <button onClick={() => removeMake(m)} disabled={busy === m.id} className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        <Trash2 className="size-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={addMake} className="flex flex-wrap items-end gap-3 border-t border-border p-5">
          <div className="min-w-48 flex-1">
            <label className="mb-1 block text-xs font-semibold text-foreground">New make</label>
            <input value={newMake} onChange={(e) => setNewMake(e.target.value)} placeholder="e.g. Indian" className={field} />
          </div>
          <button type="submit" disabled={busy === "new-make"} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
            <Plus className="size-4" /> Add make
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Models">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Make</th>
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Years</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {models.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No models yet — add one below.</td></tr>
              )}
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 text-muted-foreground">{m.makeName}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{m.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.yearFrom}–{m.yearTo}</td>
                  <td className="px-5 py-3">
                    <StatusPill label={m.status === "active" ? "Active" : "Inactive"} tone={m.status === "active" ? "green" : "gray"} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleModelStatus(m)} disabled={busy === m.id} title={m.status === "active" ? "Deactivate" : "Activate"} className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                        <Power className="size-3.5" /> {m.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => renameModel(m)} disabled={busy === m.id} className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                        <Pencil className="size-3.5" /> Edit
                      </button>
                      <button onClick={() => removeModel(m)} disabled={busy === m.id} className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        <Trash2 className="size-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={addModel} className="grid gap-3 border-t border-border p-5 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Make</label>
            <select value={modelMakeId} onChange={(e) => setModelMakeId(e.target.value)} className={field}>
              {makes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Model name</label>
            <input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="S1000RR" className={field} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Year from</label>
            <input type="number" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} placeholder="2019" className={field} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-foreground">Year to</label>
              <input type="number" value={yearTo} onChange={(e) => setYearTo(e.target.value)} placeholder="2024" className={field} />
            </div>
          </div>
          <div className="sm:col-span-4">
            <button type="submit" disabled={busy === "new-model"} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
              <Plus className="size-4" /> Add model
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
