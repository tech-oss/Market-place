"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { brands, categories, conditionOptions } from "@/mocks";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Toggle a comma-separated multi-value param and push the new URL. */
function useToggleParam() {
  const router = useRouter();
  const params = useSearchParams();

  return useCallback(
    (key: string, value: string) => {
      const current = new URLSearchParams(params.toString());
      const existing = (current.get(key)?.split(",") ?? []).filter(Boolean);
      const next = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      if (next.length) current.set(key, next.join(","));
      else current.delete(key);
      router.push(`/parts?${current.toString()}`, { scroll: false });
    },
    [params, router],
  );
}

function CheckRow({
  checked,
  label,
  count,
  onChange,
}: {
  checked: boolean;
  label: string;
  count?: number;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded border transition-colors",
          checked ? "border-brand bg-brand text-brand-foreground" : "border-input",
        )}
      >
        {checked && <X className="hidden" />}
        {checked && <span className="size-2 rounded-sm bg-brand-foreground" />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex-1 text-foreground">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
    </label>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-5 first:pt-0">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function CatalogFilters() {
  const params = useSearchParams();
  const toggle = useToggleParam();
  const router = useRouter();

  const has = (key: string, value: string) =>
    (params.get(key)?.split(",") ?? []).includes(value);

  const activeCount =
    ["brand", "category", "condition"].reduce(
      (n, k) => n + (params.get(k)?.split(",").filter(Boolean).length ?? 0),
      0,
    ) + (params.get("q") ? 1 : 0);

  return (
    <aside className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push("/parts", { scroll: false })}
            className="text-xs font-medium text-brand hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <FilterGroup title="Brand">
        {brands.map((b) => (
          <CheckRow
            key={b.slug}
            label={b.name}
            checked={has("brand", b.slug)}
            onChange={() => toggle("brand", b.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Category">
        {categories.map((c) => (
          <CheckRow
            key={c.slug}
            label={c.name}
            checked={has("category", c.slug)}
            onChange={() => toggle("category", c.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Condition">
        {conditionOptions.map((c) => (
          <CheckRow
            key={c.value}
            label={c.label}
            checked={has("condition", c.value)}
            onChange={() => toggle("condition", c.value)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}

/** Mobile: filters inside a slide-over sheet. */
export function MobileFilters() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground lg:hidden">
        <SlidersHorizontal className="size-4" />
        Filters
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] overflow-y-auto p-4">
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-2">
          <CatalogFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
}

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function CatalogSort() {
  const params = useSearchParams();
  const router = useRouter();
  const current = params.get("sort") ?? "featured";

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      Sort
      <select
        value={current}
        onChange={(e) => {
          const p = new URLSearchParams(params.toString());
          p.set("sort", e.target.value);
          router.push(`/parts?${p.toString()}`, { scroll: false });
        }}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
