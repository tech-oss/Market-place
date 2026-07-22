"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DETAILS = [
  { icon: Mail, label: "Email", value: "support@motorcycleproducts.co.za" },
  { icon: Phone, label: "Phone", value: "+27 21 000 0000" },
  { icon: MapPin, label: "Address", value: "Cape Town, South Africa" },
  { icon: Clock, label: "Hours", value: "Mon–Fri, 08:00–17:00 SAST" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHeader
        title="Contact Us"
        description="Questions about an order, selling, or your account? We're here to help."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-6">
            {sent ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <h2 className="mt-4 text-xl font-bold text-foreground">Message sent</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thanks for reaching out — we&rsquo;ll get back to you within one business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input required placeholder="Your name" aria-label="Your name" />
                  <Input required type="email" placeholder="Email address" aria-label="Email address" />
                </div>
                <Input required placeholder="Subject" aria-label="Subject" />
                <textarea
                  required
                  rows={6}
                  placeholder="How can we help?"
                  aria-label="Message"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <Button type="submit" size="lg" className="h-12">
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {DETAILS.map((d) => (
              <div key={d.label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
                <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <d.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.label}</p>
                  <p className="text-sm text-muted-foreground">{d.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
