import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getBuyerAddresses, getBuyerProfile } from "@/lib/data/account";
import { CheckoutForm } from "@/features/cart/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/cart");

  const [profile, addresses] = await Promise.all([getBuyerProfile(), getBuyerAddresses()]);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  return (
    <CheckoutForm
      initial={{
        name: defaultAddress?.fullName || profile?.fullName || "",
        phone: defaultAddress?.phone || profile?.phone || "",
        address: defaultAddress?.addressLine || "",
        city: defaultAddress?.city || "",
        postalCode: defaultAddress?.postalCode || "",
      }}
    />
  );
}
