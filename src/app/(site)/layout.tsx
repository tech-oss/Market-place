import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/** Marketing / storefront shell — header + footer around all shopper pages. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
