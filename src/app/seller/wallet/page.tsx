import { ArrowDownToLine, Clock, Wallet } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { PageHeading, SectionCard, StatCard, StatusPill } from "@/features/dashboard/ui";
import {
  DEFAULT_COMMISSION_PCT,
  walletBalanceCents,
  walletPendingCents,
  walletTxns,
} from "@/mocks/dashboard";

const TXN_TONE = {
  sale: "green",
  commission: "gray",
  payout: "blue",
  refund: "red",
} as const;

export default function SellerWalletPage() {
  return (
    <>
      <PageHeading title="Wallet" description="Your earnings, commission and payouts.">
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
          <ArrowDownToLine className="size-4" /> Request payout
        </button>
      </PageHeading>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available Balance" value={formatZAR(walletBalanceCents)} icon={Wallet} />
        <StatCard label="Pending (in escrow)" value={formatZAR(walletPendingCents)} icon={Clock} />
        <StatCard label="Platform Commission" value={`${DEFAULT_COMMISSION_PCT}%`} icon={ArrowDownToLine} />
      </div>

      <div className="mt-6">
        <SectionCard title="Transactions">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {walletTxns.map((t) => (
                  <tr key={t.id}>
                    <td className="px-5 py-3 text-foreground">{t.description}</td>
                    <td className="px-5 py-3">
                      <StatusPill label={t.type} tone={TXN_TONE[t.type]} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill label={t.status} tone={t.status === "completed" ? "green" : "amber"} />
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold ${t.amountCents < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {t.amountCents < 0 ? "−" : "+"}{formatZAR(Math.abs(t.amountCents))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
