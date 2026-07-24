import { formatZAR } from "@/lib/format";
import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { conditionLabel } from "@/lib/format";
import { getCatalogProducts } from "@/lib/data/products";

export default async function AdminListingsPage() {
  const allProducts = await getCatalogProducts();
  return (
    <>
      <PageHeading title="Listings" description="Moderate products listed across the marketplace." />

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Seller</th>
                <th className="px-5 py-3 font-medium">Condition</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allProducts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.brandName}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.seller.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{conditionLabel(p.condition)}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatZAR(p.priceCents)}</td>
                  <td className="px-5 py-3"><StatusPill label="Live" tone="green" /></td>
                  <td className="px-5 py-3 text-right">
                    <button className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
