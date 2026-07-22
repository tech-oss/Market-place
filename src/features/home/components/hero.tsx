"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { PartImage } from "@/components/shared/part-image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { brands, platformStats } from "@/mocks";

const TRUST = [
  { icon: ShieldCheck, title: "Escrow Protected", body: "Your money is safe until delivery" },
  { icon: ShieldCheck, title: "Verified Sellers", body: "Approved businesses you can trust" },
  { icon: Truck, title: "Fast Shipping", body: "Nationwide delivery through top couriers" },
  { icon: RotateCcw, title: "Easy Returns", body: "Hassle-free returns if it's not right" },
];

const MODELS = ["S1000RR", "R1", "CBR 1000RR", "Duke 390", "Panigale V4"];
const YEARS = Array.from({ length: 12 }, (_, i) => `${2024 - i}`);
const PART_TYPES = ["All Parts", "Brakes", "Engine", "Exhaust", "Suspension", "Bodywork"];

function FitmentSelects({ partNumber = false }: { partNumber?: boolean }) {
  if (partNumber) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Enter OEM / part number…"
          className="h-12 flex-1 bg-muted"
          aria-label="Part number"
        />
        <Button size="lg" className="h-12 gap-2 px-8">
          <Search className="size-4" /> Search
        </Button>
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
      <Button size="lg" className="col-span-2 h-12 gap-2 lg:col-span-1">
        <Search className="size-4" /> Search
      </Button>
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const rise = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
      };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-background">
      <Container className="pt-10 lg:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <motion.div {...rise}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
              <span className="grid size-4 place-items-center rounded-full bg-brand text-brand-foreground">
                <Zap className="size-2.5" />
              </span>
              TRUSTED BY RIDERS. POWERED BY PARTS.
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The right part.
              <br />
              The right ride.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              South Africa&rsquo;s most trusted marketplace for new and used
              motorcycle parts.
            </p>
          </motion.div>

          <motion.div
            {...(reduce ? {} : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.7, delay: 0.1 } })}
            className="relative hidden lg:block"
          >
            <PartImage
              seed="hero-moto"
              alt="Motorcycle on a mountain road"
              className="aspect-[4/3] w-full rounded-3xl"
              dark
            />
          </motion.div>
        </div>

        {/* Search panel */}
        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.15 } })}
          className="relative z-10 mt-8 rounded-2xl border border-border bg-card p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] sm:p-6"
        >
          <Tabs defaultValue="motorcycle">
            <TabsList className="mb-4 bg-muted">
              <TabsTrigger value="motorcycle">By Motorcycle</TabsTrigger>
              <TabsTrigger value="part">By Part Number</TabsTrigger>
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
          {platformStats.map((s) => (
            <div key={s.label} className="px-4 py-6">
              <p className="text-2xl font-black text-white sm:text-3xl">{s.value}</p>
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
