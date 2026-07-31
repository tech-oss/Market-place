import { createClient } from "@/lib/supabase/server";

export interface BuyerAddress {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

/** The signed-in buyer's saved delivery addresses, default first. */
export async function getBuyerAddresses(): Promise<BuyerAddress[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("buyer_addresses")
    .select("id,label,full_name,phone,address_line,city,postal_code,is_default")
    .eq("profile_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((a) => ({
    id: a.id, label: a.label, fullName: a.full_name, phone: a.phone,
    addressLine: a.address_line, city: a.city, postalCode: a.postal_code,
    isDefault: a.is_default,
  }));
}

export interface BuyerProfile {
  fullName: string;
  email: string;
  phone: string;
}

/** The signed-in buyer's editable profile fields. */
export async function getBuyerProfile(): Promise<BuyerProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles").select("full_name,email,phone").eq("id", user.id).maybeSingle();
  if (!data) return null;
  return {
    fullName: data.full_name ?? "",
    email: data.email ?? user.email ?? "",
    phone: data.phone ?? "",
  };
}
