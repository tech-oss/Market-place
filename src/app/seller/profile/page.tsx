import Link from "next/link";
import { BadgeCheck, Clock, Store } from "lucide-react";
import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { SellerProfileForm } from "@/features/dashboard/seller-profile-form";
import { KycUpload } from "@/features/dashboard/kyc-upload";
import { getCurrentSeller } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { currentSeller as demoSeller } from "@/mocks/dashboard";

export default async function SellerProfilePage() {
  const seller = await getCurrentSeller();
  const live = isSupabaseConfigured() && Boolean(seller);

  // Demo fallback when unconnected / unauthenticated.
  const view = seller ?? {
    name: demoSeller.name,
    slug: "ridefast-motorcycles",
    location: demoSeller.location,
    status: "active",
    business_type: "Dealership",
    id_doc_url: "demo",
    proof_of_residence_url: "demo",
  };

  const isActive = view.status === "active";
  const idUploaded = Boolean(view.id_doc_url);
  const proofUploaded = Boolean(view.proof_of_residence_url);

  return (
    <>
      <PageHeading title="Business Profile" description="Your storefront details and verification status." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SellerProfileForm
          live={live}
          initial={{
            name: view.name,
            businessType: view.business_type ?? "Dealership",
            location: view.location ?? "",
          }}
        />

        <div className="space-y-6">
          <SectionCard title="Verification">
            <div className="space-y-4 p-5">
              {isActive ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3">
                  <BadgeCheck className="size-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Verified Seller</p>
                    <p className="text-xs text-emerald-700">Approved & live on the marketplace</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3">
                  <Clock className="size-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Pending Review</p>
                    <p className="text-xs text-amber-700">Upload both documents to get verified</p>
                  </div>
                </div>
              )}

              <KycUpload kind="id" label="ID Document" uploaded={idUploaded} />
              <KycUpload kind="proof" label="Proof of Residence" uploaded={proofUploaded} />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Documents</span>
                <StatusPill
                  label={idUploaded && proofUploaded ? "Submitted" : "Incomplete"}
                  tone={idUploaded && proofUploaded ? "green" : "amber"}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Storefront">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-ink text-white"><Store className="size-5" /></span>
                <div>
                  <p className="font-semibold text-foreground">{view.name}</p>
                  {isActive ? (
                    <Link href={`/sellers/${view.slug}`} className="text-xs font-medium text-brand hover:underline">
                      View public storefront →
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">Goes live once approved</span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
