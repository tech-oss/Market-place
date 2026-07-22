import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Prose } from "@/components/shared/prose";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "How shipping and nationwide delivery works on Motorcycle Products.",
};

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        title="Shipping & Delivery"
        crumbs={[{ label: "Home", href: "/" }, { label: "Shipping & Delivery" }]}
      />
      <Container className="py-12">
        <Prose>
          <h2>Seller-managed shipping</h2>
          <p>
            Each seller sets their own shipping cost and chooses the courier that suits
            the item. You&rsquo;ll always see the exact delivery cost and estimated time
            before you pay — there are no surprise fees at checkout.
          </p>

          <h2>Couriers we support</h2>
          <ul>
            <li><strong>PUDO</strong> — affordable locker-to-locker delivery, ideal for smaller parts.</li>
            <li><strong>The Courier Guy</strong> — reliable door-to-door nationwide.</li>
            <li><strong>Aramex</strong> — fast tracked delivery across South Africa.</li>
          </ul>

          <h2>Tracking</h2>
          <p>
            Once a seller dispatches your order, you&rsquo;ll receive tracking details so
            you can follow your part all the way to your door.
          </p>

          <h2>Delivery times</h2>
          <p>
            Most orders arrive within 1–3 business days after dispatch, depending on the
            courier and your location. Outlying areas may take a little longer.
          </p>
        </Prose>
      </Container>
    </>
  );
}
