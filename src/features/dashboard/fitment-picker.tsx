"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchableSelect, type SearchableOption } from "@/components/shared/searchable-select";
import type { BikeMake, BikeModel } from "@/lib/data/products";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

/** What the parent form needs at submit time. */
export interface ResolvedFitment {
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  newYmm?: { makeName: string; modelName: string; yearFrom: number; yearTo: number };
}

export interface FitmentInitial {
  brand?: string | null;
  model?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
}

const CURRENT_YEAR = new Date().getFullYear();
const FALLBACK_YEARS = Array.from({ length: CURRENT_YEAR + 1 - 1970 + 1 }, (_, i) => CURRENT_YEAR + 1 - i);

/**
 * Finds a bike make mentioned in a listing title so the seller doesn't have to
 * pick it again — "BMW K1600 Xenon Headlight" preselects BMW. Longest name
 * first so "Harley-Davidson" beats a stray "Davidson", and word-boundary
 * matched so "Beta" doesn't fire on "Better".
 */
export function detectMakeFromTitle(title: string, makes: BikeMake[]): BikeMake | undefined {
  const haystack = ` ${title.toLowerCase()} `;
  return [...makes]
    .sort((a, b) => b.name.length - a.name.length)
    .find((m) => {
      const needle = m.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9])${needle}([^a-z0-9]|$)`).test(haystack);
    });
}

export function FitmentPicker({
  bikeMakes,
  bikeModels,
  initial,
  titleHint,
  onChange,
}: {
  bikeMakes: BikeMake[];
  bikeModels: BikeModel[];
  initial?: FitmentInitial;
  /** Listing title — used to auto-select a make until the seller picks one. */
  titleHint: string;
  onChange: (value: ResolvedFitment) => void;
}) {
  const [mode, setMode] = useState<"catalog" | "request">("catalog");

  const initialMakeId =
    bikeMakes.find((m) => m.name.toLowerCase() === (initial?.brand ?? "").toLowerCase())?.id ?? "";
  const [makeId, setMakeId] = useState(initialMakeId);
  const [makeTouched, setMakeTouched] = useState(Boolean(initialMakeId));
  const [autoDetected, setAutoDetected] = useState(false);

  const modelsForMake = useMemo(
    () => bikeModels.filter((m) => m.makeId === makeId),
    [bikeModels, makeId],
  );

  const [modelId, setModelId] = useState(
    () => modelsForMake.find((m) => m.name.toLowerCase() === (initial?.model ?? "").toLowerCase())?.id ?? "",
  );
  const [year, setYear] = useState(
    initial?.yearFrom && initial.yearFrom === initial.yearTo ? String(initial.yearFrom) : "",
  );

  const [reqMake, setReqMake] = useState("");
  const [reqModel, setReqModel] = useState("");
  const [reqYearFrom, setReqYearFrom] = useState("");
  const [reqYearTo, setReqYearTo] = useState("");

  const selectedModel = modelsForMake.find((m) => m.id === modelId);

  // Auto-select a make from the title until the seller picks one themselves.
  useEffect(() => {
    if (makeTouched) return;
    const hit = detectMakeFromTitle(titleHint, bikeMakes);
    if (hit && hit.id !== makeId) {
      setMakeId(hit.id);
      setModelId("");
      setYear("");
      setAutoDetected(true);
    }
  }, [titleHint, bikeMakes, makeTouched, makeId]);

  const makeOptions: SearchableOption[] = useMemo(
    () => bikeMakes.map((m) => ({ value: m.id, label: m.name })),
    [bikeMakes],
  );
  const modelOptions: SearchableOption[] = useMemo(
    () => modelsForMake.map((m) => ({ value: m.id, label: `${m.name} (${m.yearFrom}–${m.yearTo})`, keywords: m.name })),
    [modelsForMake],
  );
  const yearOptions: SearchableOption[] = useMemo(() => {
    const years = selectedModel
      ? Array.from({ length: selectedModel.yearTo - selectedModel.yearFrom + 1 }, (_, i) => selectedModel.yearTo - i)
      : FALLBACK_YEARS;
    return years.map((y) => ({ value: String(y), label: String(y) }));
  }, [selectedModel]);

  // Report the resolved fitment upward whenever any part of it changes.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    if (mode === "request") {
      const yf = parseInt(reqYearFrom, 10);
      const yt = parseInt(reqYearTo, 10);
      onChangeRef.current(
        reqMake.trim() && reqModel.trim() && Number.isFinite(yf) && Number.isFinite(yt)
          ? { newYmm: { makeName: reqMake.trim(), modelName: reqModel.trim(), yearFrom: yf, yearTo: yt } }
          : {},
      );
      return;
    }

    const make = bikeMakes.find((m) => m.id === makeId);
    if (!make) { onChangeRef.current({}); return; }

    const y = parseInt(year, 10);
    const hasYear = Number.isFinite(y);
    onChangeRef.current({
      brand: make.name,
      model: selectedModel?.name,
      // A specific year narrows the fitment; otherwise fall back to the
      // model's full production range, and leave it open when neither is set.
      yearFrom: hasYear ? y : selectedModel?.yearFrom,
      yearTo: hasYear ? y : selectedModel?.yearTo,
    });
  }, [mode, makeId, modelId, year, reqMake, reqModel, reqYearFrom, reqYearTo, bikeMakes, selectedModel]);

  const changeMake = (id: string) => {
    setMakeId(id);
    setMakeTouched(true);
    setAutoDetected(false);
    setModelId("");
    setYear("");
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className={`${labelCls} mb-0`}>
          Compatibility <span className="font-normal text-muted-foreground">— only the make is required</span>
        </label>
        <button
          type="button"
          onClick={() => setMode(mode === "catalog" ? "request" : "catalog")}
          className="text-xs font-medium text-brand hover:underline"
        >
          {mode === "catalog" ? "Can't find your bike? Request it" : "Use existing catalog instead"}
        </button>
      </div>

      {mode === "catalog" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Make *</label>
              <SearchableSelect
                value={makeId}
                onChange={changeMake}
                options={makeOptions}
                placeholder="Select make"
                searchPlaceholder="Search makes…"
                emptyLabel="No makes match"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Model</label>
              <SearchableSelect
                value={modelId}
                onChange={(v) => { setModelId(v); setYear(""); }}
                options={modelOptions}
                placeholder={modelsForMake.length ? "Any model" : "None listed yet"}
                searchPlaceholder="Search models…"
                emptyLabel="No models match"
                clearLabel="Any / not listed"
                disabled={!makeId || modelsForMake.length === 0}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Year</label>
              <SearchableSelect
                value={year}
                onChange={setYear}
                options={yearOptions}
                placeholder="Any year"
                searchPlaceholder="Search years…"
                emptyLabel="No years match"
                clearLabel="Any / not sure"
                disabled={!makeId}
              />
            </div>
          </div>

          {autoDetected && (
            <p className="mt-1.5 text-[11px] text-emerald-700">
              Make auto-detected from the title — change it above if that&rsquo;s wrong.
            </p>
          )}
          {makeId && modelsForMake.length === 0 && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              No models listed for this make yet. You can still publish with just the make, or request the model above.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={reqMake} onChange={(e) => setReqMake(e.target.value)} placeholder="Make, e.g. Indian" className={field} />
            <input value={reqModel} onChange={(e) => setReqModel(e.target.value)} placeholder="Model, e.g. FTR 1200" className={field} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input type="number" value={reqYearFrom} onChange={(e) => setReqYearFrom(e.target.value)} placeholder="Year from" className={field} />
            <input type="number" value={reqYearTo} onChange={(e) => setReqYearTo(e.target.value)} placeholder="Year to" className={field} />
          </div>
          <p className="mt-1.5 text-[11px] text-amber-700">
            This listing is held for admin review until the new make/model/year is approved.
          </p>
        </>
      )}
    </div>
  );
}
