"use client";

import Image from "next/image";
import { useRef } from "react";
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
import { brands } from "@/mocks";

interface PlatformStat {
  label: string;
  value: string;
}

const TRUST = [
  { icon: ShieldCheck, title: "Escrow Protected", body: "Your money is safe until delivery" },
  { icon: ShieldCheck, title: "Verified Sellers", body: "Approved businesses you can trust" },
  { icon: Truck, title: "Fast Shipping", body: "Nationwide delivery through top couriers" },
  { icon: RotateCcw, title: "Easy Returns", body: "Hassle-free returns if it's not right" },
];

const MODELS = ["S1000RR", "R1", "CBR 1000RR", "Duke 390", "Panigale V4"];
const YEARS = Array.from({ length: 12 }, (_, i) => `${2024 - i}`);
const PART_TYPES = ["All Parts", "Brakes", "Engine", "Exhaust", "Suspension", "Bodywork"];

const SEARCH_BTN =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-8 text-sm font-semibold text-ink-foreground transition-transform hover:bg-neutral-800 active:translate-y-px";

function FitmentSelects({ partNumber = false }: { partNumber?: boolean }) {
  if (partNumber) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Enter OEM / part number…"
          className="h-12 flex-1 bg-muted"
          aria-label="Part number"
        />
        <button type="button" className={SEARCH_BTN}>
          <Search className="size-4" /> Search
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Select>
        <SelectTrigger className="!h-12 bg-muted" aria-label="Make">
          <SelectValue placeholder="Make" />
        </SelectTrigger>
        <SelectContent>
          {brands.map((b) => (
            <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="!h-12 bg-muted" aria-label="Model">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          {MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="!h-12 bg-muted" aria-label="Year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select defaultValue="All Parts">
        <SelectTrigger className="!h-12 bg-muted" aria-label="Part type">
          <SelectValue placeholder="Part Type" />
        </SelectTrigger>
        <SelectContent>
          {PART_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>
      <button type="button" className={`${SEARCH_BTN} col-span-2 lg:col-span-1`}>
        <Search className="size-4" /> Search
      </button>
    </div>
  );
}

export function Hero({ stats }: { stats: PlatformStat[] }) {
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
              <FitmentSelects />
            </TabsContent>
            <TabsContent value="part">
              <FitmentSelects partNumber />
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
