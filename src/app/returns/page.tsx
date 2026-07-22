import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Prose } from "@/components/shared/prose";

export const metadata: Metadata = {
  title: "Returns",
  description: "Our returns and refund policy, backed by escrow buyer protection.",
};

export default function ReturnsPage() {
  return (
    <>
      <PageHeader
        title="Returns & Refunds"
        crumbs={[{ label: "Home", href: "/" }, { label: "Returns" }]}
      />
      <Container className="py-12">
        <Prose>
          <h2>7-day buyer protection</h2>
          <p>
            You have <strong>7 days from delivery</strong> to inspect your part. If it&rsquo;s
            not as described, faulty, or doesn&rsquo;t match the listed fitment, you can raise
            a return directly from your order.
          </p>

          <h2>How refunds work</h2>
          <p>
            Because your payment is held in escrow until you confirm delivery, refunds are
            straightforward. If a return is approved, the held funds are returned to you —
            we don&rsquo;t need to chase the seller for your money.
          </p>

          <h2>What can be returned</h2>
          <ul>
            <li>Parts that arrive damaged or faulty.</li>
            <li>Items that don&rsquo;t match the listing description or condition.</li>
            <li>Wrong item sent by the seller.</li>
          </ul>

          <h2>What can&rsquo;t be returned</h2>
          <ul>
            <li>Correctly described used parts where normal wear was disclosed.</li>
            <li>Electrical parts that have been fitted or installed.</li>
            <li>Items reported after the 7-day window has closed.</li>
          </ul>

          <h2>Raising a return</h2>
          <p>
            Go to your order in <strong>My Account</strong>, choose <em>Return / Dispute</em>,
            and describe the issue with photos. Our team mediates between you and the seller
            to reach a fair outcome.
          </p>
        </Prose>
      </Container>
    </>
  );
}
