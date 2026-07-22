import { BadgeCheck, FileCheck2, MapPin, Store } from "lucide-react";
import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { currentSeller } from "@/mocks/dashboard";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

export default function SellerProfilePage() {
  return (
    <>
      <PageHeading title="Business Profile" description="Your storefront details and verification status." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard title="Business details">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Business name</label>
              <input defaultValue={currentSeller.name} className={field} />
            </div>
            <div>
              <label className={labelCls}>Business type</label>
              <select defaultValue="Dealership" className={field}>
                <option>Dealership</option><option>Scrapyard</option><option>Workshop</option><option>Individual</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input defaultValue={currentSeller.location} className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>About your business</label>
              <textarea rows={3} defaultValue="Trusted Johannesburg dealer of quality used and OEM sportbike parts." className={field} />
            </div>
            <div className="sm:col-span-2">
              <button className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90">
                Save changes
              </button>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Verification">
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3">
                <BadgeCheck className="size-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Verified Seller</p>
                  <p className="text-xs text-emerald-700">Approved {new Date(currentSeller.memberSince).getFullYear()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground"><FileCheck2 className="size-4 text-muted-foreground" /> ID Document</span>
                <StatusPill label="Approved" tone="green" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground"><MapPin className="size-4 text-muted-foreground" /> Proof of Residence</span>
                <StatusPill label="Approved" tone="green" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Storefront">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-ink text-white"><Store className="size-5" /></span>
                <div>
                  <p className="font-semibold text-foreground">{currentSeller.name}</p>
                  <a href="/sellers/ridefast-motorcycles" className="text-xs font-medium text-brand hover:underline">
                    View public storefront →
                  </a>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
