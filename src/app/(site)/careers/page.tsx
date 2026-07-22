import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Prose } from "@/components/shared/prose";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the team building South Africa's leading motorcycle parts marketplace.",
};

const OPENINGS = [
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "Cape Town / Remote", type: "Full-time" },
  { title: "Seller Success Manager", team: "Operations", location: "Johannesburg", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Remote (SA)", type: "Full-time" },
  { title: "Customer Support Agent", team: "Support", location: "Cape Town", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        title="Careers"
        description="Help us make motorcycle parts trade safer and simpler across South Africa."
        crumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />
      <Container className="py-12">
        <Prose className="mb-10">
          <h2>Life at Motorcycle Products</h2>
          <p>
            We&rsquo;re a small, fast-moving team of engineers, designers and moto
            enthusiasts. We value ownership, craft and looking after our sellers and
            buyers. If that sounds like you, we&rsquo;d love to talk.
          </p>
        </Prose>

        <h2 className="mb-4 text-xl font-bold text-foreground">Open positions</h2>
        <ul className="space-y-3">
          {OPENINGS.map((job) => (
            <li
              key={job.title}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div>
                <p className="font-semibold text-foreground">{job.title}</p>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{job.team}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" /> {job.location}
                  </span>
                  <span>{job.type}</span>
                </p>
              </div>
              <Link
                href="/contact"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                Apply
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
