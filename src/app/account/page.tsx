import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Package, Store, User } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { PartImage } from "@/components/shared/part-image";
import { formatZAR } from "@/lib/format";
import { allProducts } from "@/mocks";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = {
  title: "My Account",
  description: "Your orders, escrow status, addresses and seller tools.",
};

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  "pending-payment": { label: "Pending Payment", className: "bg-amber-100 text-amber-800" },
  "paid-held": { label: "In Escrow", className: "bg-blue-100 text-blue-800" },
  shipped: { label: "Shipped", className: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Delivered", className: "bg-teal-100 text-teal-800" },
  confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-800" },
  released: { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
  disputed: { label: "Disputed", className: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", className: "bg-neutral-200 text-neutral-700" },
  cancelled: { label: "Cancelled", className: "bg-neutral-200 text-neutral-700" },
};

const ORDERS: { id: string; productId: string; status: OrderStatus; date: string }[] = [
  { id: "MP-10482", productId: "p-1", status: "paid-held", date: "22 Jul 2026" },
  { id: "MP-10461", productId: "p-16", status: "shipped", date: "19 Jul 2026" },
  { id: "MP-10399", productId: "p-3", status: "released", date: "08 Jul 2026" },
];

export default function AccountPage() {
  return (
    <>
      <PageHeader
        title="My Account"
        crumbs={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-ink text-white">
                <User className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Guest Rider</p>
                <p className="text-xs text-muted-foreground">Buyer account</p>
              </div>
            </div>
            <nav className="mt-5 flex flex-col text-sm">
              {[
                { icon: Package, label: "Orders" },
                { icon: MapPin, label: "Addresses" },
                { icon: User, label: "Profile" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-foreground first:bg-muted first:font-medium"
                >
                  <item.icon className="size-4" /> {item.label}
                </span>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <div className="space-y-8">
            {/* Orders */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">Recent Orders</h2>
              <ul className="space-y-4">
                {ORDERS.map((order) => {
                  const product = allProducts.find((p) => p.id === order.productId)!;
                  const meta = STATUS_META[order.status];
                  return (
                    <li
                      key={order.id}
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
                    >
                      <PartImage seed={product.id} alt={product.title} className="size-16 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Order {order.id} · {order.date}</p>
                        <Link
                          href={`/parts/${product.slug}`}
                          className="font-semibold text-foreground hover:text-brand"
                        >
                          {product.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{formatZAR(product.priceCents)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                        {meta.label}
                      </span>
                      {order.status === "shipped" && (
                        <button className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground">
                          Confirm delivery
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Become a seller */}
            <section className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-8">
              <div className="relative max-w-lg">
                <Store className="size-7 text-brand" />
                <h2 className="mt-3 text-2xl font-black">Become a Seller</h2>
                <p className="mt-2 text-sm text-white/70">
                  Turn your parts into income. Register your business, upload your ID and
                  proof of residence, and start listing once approved. Flat 7% commission,
                  unlimited free listings.
                </p>
                <Link
                  href="/sell"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
                >
                  Learn about selling <ArrowRight className="size-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
