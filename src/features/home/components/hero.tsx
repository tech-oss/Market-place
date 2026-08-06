"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { RotateCcw, Search, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/shared/container";
import { CountUp } from "@/components/shared/count-up";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { FitmentFacet } from "@/lib/data/products";

interface PlatformStat {
  label: string;
  value: string;
}

const TRUST = [
  { icon: ShieldCheck, title: "Buyer Protection", body: "Your money is safe until delivery" },
  { icon: ShieldCheck, title: "Verified Sellers", body: "Approved businesses you can trust" },
  { icon: Truck, title: "Fast Shipping", body: "Nationwide delivery through top couriers" },
  { icon: RotateCcw, title: "Easy Returns", body: "Hassle-free returns if it's not right" },
];

const PART_TYPES = ["All Parts", "Brakes", "Engine", "Exhaust", "Suspension", "Bodywork"];

const SEARCH_BTN =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-8 text-sm font-semibold text-ink-foreground transition-transform hover:bg-neutral-800 active:translate-y-px";

function PartNumberSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const search = () => router.push(value.trim() ? `/parts?q=${encodeURIComponent(value.trim())}` : "/parts");
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && search()}
        placeholder="Enter OEM / part number…"
        className="h-12 flex-1 bg-muted"
        aria-label="Part number"
      />
      <button type="button" onClick={search} className={SEARCH_BTN}>
        <Search className="size-4" /> Search
      </button>
    </div>
  );
}

/**
 * Make/Model/Year reflect *actual live inventory* — sourced from the
 * fitments of active listings, not a static list. A make with no stock
 * simply won't appear, and Model/Year cascade from whatever's really there.
 */
function FitmentSelects({ facets }: { facets: FitmentFacet[] }) {
  const router = useRouter();
  const [make, setMake] = useState<string>();
  const [model, setModel] = useState<string>();
  const [year, setYear] = useState<string>();
  const [partType, setPartType] = useState("All Parts");

  const makes = useMemo(
    () => Array.from(new Set(facets.map((f) => f.brand))).sort(),
    [facets],
  );
  // Model and year are optional on a listing's fitment, so only offer the
  // ones sellers actually supplied.
  const models = useMemo(
    () =>
      Array.from(
        new Set(
          facets
            .filter((f) => (!make || f.brand === make) && f.model)
            .map((f) => f.model as string),
        ),
      ).sort(),
    [facets, make],
  );
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const f of facets) {
      if (make && f.brand !== make) continue;
      if (model && f.model !== model) continue;
      if (f.yearFrom == null || f.yearTo == null) continue;
      for (let y = f.yearFrom; y <= f.yearTo; y++) set.add(y);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [facets, make, model]);

  const search = () => {
    const tokens = [make, model, year, partType !== "All Parts" ? partType : undefined].filter(Boolean);
    router.push(tokens.length ? `/parts?q=${encodeURIComponent(tokens.join(" "))}` : "/parts");
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Select value={make} onValueChange={(v) => { setMake(v ?? undefined); setModel(undefined); setYear(undefined); }}>
        <SelectTrigger className="!h-12 bg-muted" aria-label="Make">
          <SelectValue placeholder={makes.length ? "Make" : "No stock yet"} />
        </SelectTrigger>
        <SelectContent>
          {makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={model} onValueChange={(v) => { setModel(v ?? undefined); setYear(undefined); }} disabled={models.length === 0}>
        <SelectTrigger className="!h-12 bg-muted" aria-label="Model">
          <SelectValue placeholder={models.length ? "Model" : "—"} />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={(v) => setYear(v ?? undefined)} disabled={years.length === 0}>
        <SelectTrigger className="!h-12 bg-muted" aria-label="Year">
          <SelectValue placeholder={years.length ? "Year" : "—"} />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={partType} onValueChange={(v) => setPartType(v ?? "All Parts")}>
        <SelectTrigger className="!h-12 bg-muted" aria-label="Part type">
          <SelectValue placeholder="Part Type" />
        </SelectTrigger>
        <SelectContent>
          {PART_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>
      <button type="button" onClick={search} className={`${SEARCH_BTN} col-span-2 lg:col-span-1`}>
        <Search className="size-4" /> Search
      </button>
    </div>
  );
}

export function Hero({ stats, facets }: { stats: PlatformStat[]; facets: FitmentFacet[] }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 22 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
        },
      };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-background">
      <Container className="pt-8 lg:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.span
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-foreground shadow-sm"
            >
              <span className="size-2 rounded-full bg-brand" />
              TRUSTED BY RIDERS. POWERED BY PARTS.
            </motion.span>
            <motion.h1
              variants={item}
              className="mt-5 text-4xl font-black leading-[1.03] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              The right part.
              <br />
              The right ride.
            </motion.h1>
            <motion.p variants={item} className="mt-4 max-w-md text-base text-muted-foreground">
              South Africa&rsquo;s most trusted marketplace for new and used
              motorcycle parts.
            </motion.p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative aspect-[16/10] overflow-hidden rounded-3xl sm:aspect-[2/1] lg:aspect-[4/3]"
          >
            <motion.div style={{ y: imageY }} className="absolute inset-0 -top-[7%] h-[114%]">
              <Image
                src="/img/hero-motorcycle.jpg"
                alt="Motorcycle parked on a forest road"
                fill
                priority
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5" />
          </motion.div>
        </div>

        {/* Search panel */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 mt-8 rounded-2xl border border-border bg-card p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] sm:p-6"
        >
          <Tabs defaultValue="motorcycle">
            <TabsList className="mb-4 bg-muted">
              <TabsTrigger value="motorcycle" className="uppercase tracking-wide">By Motorcycle</TabsTrigger>
              <TabsTrigger value="part" className="uppercase tracking-wide">By Part Number</TabsTrigger>
            </TabsList>
            <TabsContent value="motorcycle">
              <FitmentSelects facets={facets} />
            </TabsContent>
            <TabsContent value="part">
              <PartNumberSearch />
            </TabsContent>
          </Tabs>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 lg:grid-cols-4">
            {TRUST.map((t) => (
              <div key={t.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                  <t.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>

      {/* Stat bar */}
      <Container className="pb-14 pt-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-ink text-center lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-6">
              <CountUp value={s.value} className="block text-2xl font-black text-white sm:text-3xl" />
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/50">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
