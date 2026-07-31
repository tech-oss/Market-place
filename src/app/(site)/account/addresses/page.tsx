import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { getSessionUser } from "@/lib/auth";
import { getBuyerAddresses } from "@/lib/data/account";
import { AccountSidebar } from "@/features/account/account-sidebar";
import { AddressesBoard } from "@/features/account/addresses-board";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/addresses");

  const { welcome } = await searchParams;
  const addresses = await getBuyerAddresses();
  const displayName = user.fullName || user.email || "Rider";

  return (
    <>
      <PageHeader
        title="My Addresses"
        crumbs={[{ label: "Home", href: "/" }, { label: "My Account", href: "/account" }, { label: "Addresses" }]}
      />
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <AccountSidebar displayName={displayName} roleLabel={user.role} />
          <div>
            {welcome === "1" && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-5">
                <div>
                  <p className="font-semibold text-foreground">Add a delivery address?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save one now to speed up checkout — or skip and add it anytime from here.
                  </p>
                </div>
                <Link href="/account" className="text-sm font-semibold text-brand hover:underline">
                  Skip for now →
                </Link>
              </div>
            )}
            <AddressesBoard initial={addresses} />
          </div>
        </div>
      </Container>
    </>
  );
}
