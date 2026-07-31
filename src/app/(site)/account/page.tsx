import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LayoutDashboard, MapPin, Package, ShieldCheck, Store, User } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatZAR } from "@/lib/format";
import { getSessionUser } from "@/lib/auth";
import { getBuyerOrders, getCommissionPct } from "@/lib/data/dashboard";
import { signOut } from "@/features/auth/actions";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = {
  title: "My Account",
  description: "Your orders, buyer protection status, addresses and seller tools.",
};

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  "pending-payment": { label: "Pending Payment", className: "bg-amber-100 text-amber-800" },
  "paid-held": { label: "In Buyer Protection", className: "bg-blue-100 text-blue-800" },
  shipped: { label: "Shipped", className: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Delivered", className: "bg-teal-100 text-teal-800" },
  confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-800" },
  released: { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
  disputed: { label: "Disputed", className: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", className: "bg-neutral-200 text-neutral-700" },
  cancelled: { label: "Cancelled", className: "bg-neutral-200 text-neutral-700" },
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const displayName = user.fullName || user.email || "Rider";
  const [orders, commissionPct] = await Promise.all([getBuyerOrders(), getCommissionPct()]);

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
                <p className="font-semibold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role} account</p>
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
            <form action={signOut} className="mt-3 border-t border-border pt-3">
              <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                Sign out
              </button>
            </form>
          </aside>

          {/* Main */}
          <div className="space-y-8">
            {/* Orders */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">Recent Orders</h2>
              {orders.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No orders yet"
                  description="When you buy a part, your orders and their buyer protection status show up here."
                  action={{ label: "Shop parts", href: "/parts" }}
                />
              ) : (
                <ul className="space-y-4">
                  {orders.map((order) => {
                    const meta = STATUS_META[order.status];
                    const first = order.items[0];
                    const extra = order.items.length - 1;
                    const date = new Date(order.placedAt).toLocaleDateString("en-ZA", {
                      year: "numeric", month: "short", day: "numeric",
                    });
                    return (
                      <li key={order.id}>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-neutral-300"
                        >
                          <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                            <Package className="size-6" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Order {order.reference} · {date}</p>
                            <span className="font-semibold text-foreground">{first?.title ?? "Item"}</span>
                            {extra > 0 && <span className="text-sm text-muted-foreground"> + {extra} more</span>}
                            <p className="text-sm text-muted-foreground">{formatZAR(order.totalCents)}</p>
                            {order.tracking && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Shipped via <span className="font-medium text-foreground">{order.courier}</span> · Tracking: {order.tracking}
                                {order.shippingService ? ` · ${order.shippingService}` : ""}
                              </p>
                            )}
                            {order.shippingNote && (
                              <p className="mt-0.5 text-xs text-muted-foreground">Note: {order.shippingNote}</p>
                            )}
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                            {meta.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Dashboard access — only for roles that actually have one */}
            {(user.role === "seller" || user.role === "admin") && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">Dashboards</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(user.role === "seller" || user.role === "admin") && (
                  <Link href="/seller" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand"><LayoutDashboard className="size-5" /></span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Seller Center</p>
                      <p className="text-xs text-muted-foreground">Listings, orders, wallet & labels</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand"><ShieldCheck className="size-5" /></span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Admin Console</p>
                      <p className="text-xs text-muted-foreground">Approvals, buyer protection & commission</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
            </section>
            )}

            {/* Become a seller */}
            <section className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-8">
              <div className="relative max-w-lg">
                <Store className="size-7 text-brand" />
                <h2 className="mt-3 text-2xl font-black">Become a Seller</h2>
                <p className="mt-2 text-sm text-white/70">
                  Turn your parts into income. Register your business, upload your ID and
                  proof of residence, and start listing once approved. Flat {commissionPct}% commission,
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
