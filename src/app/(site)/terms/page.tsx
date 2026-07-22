import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Prose } from "@/components/shared/prose";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms governing use of the Motorcycle Products marketplace.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms & Conditions"
        description="Last updated: 22 July 2026"
        crumbs={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]}
      />
      <Container className="py-12">
        <Prose>
          <h2>1. Introduction</h2>
          <p>
            These terms govern your use of Motorcycle Products (Pty) Ltd (&ldquo;the
            platform&rdquo;). By using the platform as a buyer or seller, you agree to
            these terms. This is a preview document and does not constitute legal advice.
          </p>

          <h2>2. Accounts</h2>
          <p>
            You are responsible for keeping your account secure. Sellers must provide
            accurate business details, a valid ID and proof of residence, and may only
            trade once approved.
          </p>

          <h2>3. Escrow payments</h2>
          <p>
            Buyer payments are held by the platform and released to the seller only after
            the buyer confirms delivery. A flat commission of <strong>7%</strong> is
            deducted from each completed sale.
          </p>

          <h2>4. Listings</h2>
          <p>
            Sellers must describe parts accurately, including condition, fitment and OEM
            numbers. Counterfeit, stolen or unsafe parts are strictly prohibited.
          </p>

          <h2>5. Returns & disputes</h2>
          <p>
            Buyers may raise a return within 7 days of delivery. The platform mediates
            disputes and may refund the buyer from the escrow hold where appropriate.
          </p>

          <h2>6. Liability</h2>
          <p>
            The platform facilitates transactions between buyers and sellers but is not the
            manufacturer or seller of listed parts. Fitment and installation remain the
            buyer&rsquo;s responsibility.
          </p>

          <h2>7. Governing law</h2>
          <p>
            These terms are governed by the laws of the Republic of South Africa.
          </p>
        </Prose>
      </Container>
    </>
  );
}
