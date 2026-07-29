"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

/**
 * Free-text keyword search for the shop page. Pushes the query into the `q`
 * URL param (debounced) so the server page re-filters the catalog by title,
 * SKU, brand, make, model and year.
 */
export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  // Keep the input in sync if the URL changes elsewhere (e.g. "Clear filters").
  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  const commit = (q: string) => {
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    router.push(`/parts?${next.toString()}`, { scroll: false });
  };

  // Debounce URL pushes so we don't navigate on every keystroke.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (value === current) return;
    const t = setTimeout(() => commit(value), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commit(value);
      }}
      className="relative mb-6"
      role="search"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search parts by name, SKU, make, model or year…"
        aria-label="Search parts"
        className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
