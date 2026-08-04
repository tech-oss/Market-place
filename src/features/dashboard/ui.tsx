import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand">
          <Icon className="size-5" />
        </span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              trend.up ? "text-emerald-600" : "text-red-600",
            )}
          >
            {trend.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-black text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-white", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          {title && <h2 className="font-bold text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const PILL_STYLES: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  indigo: "bg-indigo-100 text-indigo-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-neutral-200 text-neutral-700",
  teal: "bg-teal-100 text-teal-800",
};

export function StatusPill({
  label,
  tone = "gray",
}: {
  label: string;
  tone?: keyof typeof PILL_STYLES;
}) {
  return (
    <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", PILL_STYLES[tone])}>
      {label}
    </span>
  );
}

/** Lightweight dependency-free bar chart. */
export function MiniBarChart({
  data,
  labels,
  className,
}: {
  data: number[];
  labels?: string[];
  className?: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className={cn("flex h-40 items-end gap-2", className)}>
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-brand/70 to-brand transition-all"
              style={{ height: `${(v / max) * 100}%` }}
              title={String(v)}
            />
          </div>
          {labels && <span className="text-[10px] text-muted-foreground">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}
