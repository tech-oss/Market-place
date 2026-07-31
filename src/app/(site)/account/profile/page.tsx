import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { getSessionUser } from "@/lib/auth";
import { getBuyerProfile } from "@/lib/data/account";
import { AccountSidebar } from "@/features/account/account-sidebar";
import { BuyerProfileForm } from "@/features/account/buyer-profile-form";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function BuyerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/profile");

  const { welcome } = await searchParams;
  const profile = await getBuyerProfile();
  const displayName = user.fullName || user.email || "Rider";

  return (
    <>
      <PageHeader
        title="Profile Settings"
        crumbs={[{ label: "Home", href: "/" }, { label: "My Account", href: "/account" }, { label: "Profile" }]}
      />
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <AccountSidebar displayName={displayName} roleLabel={user.role} />
          <div>
            {welcome === "1" && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-5">
                <div>
                  <p className="font-semibold text-foreground">Welcome to Motorcycle Products!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your phone number now so sellers and couriers can reach you — or skip and do it later.
                  </p>
                </div>
                <Link href="/account/addresses?welcome=1" className="text-sm font-semibold text-brand hover:underline">
                  Skip for now →
                </Link>
              </div>
            )}
            <BuyerProfileForm
              initial={{
                fullName: profile?.fullName || user.fullName || "",
                email: profile?.email || user.email || "",
                phone: profile?.phone || "",
              }}
            />
            {welcome === "1" && (
              <div className="mt-4 flex justify-end">
                <Link
                  href="/account/addresses?welcome=1"
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Next: add a delivery address →
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
