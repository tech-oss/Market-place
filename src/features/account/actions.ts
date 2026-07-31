"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/features/dashboard/actions";

/** Buyer: update name/phone on their profile. */
export async function updateBuyerProfile(input: { fullName: string; phone: string }): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName, phone: input.phone })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { ok: true };
}

export interface AddressInput {
  label?: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

/** Buyer: save a new delivery address. */
export async function createAddress(input: AddressInput): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { count } = await supabase
    .from("buyer_addresses").select("id", { count: "exact", head: true }).eq("profile_id", user.id);
  const makeDefault = input.isDefault || !count;

  if (makeDefault) {
    await supabase.from("buyer_addresses").update({ is_default: false }).eq("profile_id", user.id);
  }
  const { error } = await supabase.from("buyer_addresses").insert({
    profile_id: user.id, label: input.label || null, full_name: input.fullName, phone: input.phone,
    address_line: input.addressLine, city: input.city, postal_code: input.postalCode,
    is_default: makeDefault,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account/addresses");
  revalidatePath("/account/profile");
  return { ok: true };
}

/** Buyer: edit an existing address they own. */
export async function updateAddress(id: string, input: AddressInput): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  if (input.isDefault) {
    await supabase.from("buyer_addresses").update({ is_default: false }).eq("profile_id", user.id);
  }
  const { error } = await supabase
    .from("buyer_addresses")
    .update({
      label: input.label || null, full_name: input.fullName, phone: input.phone,
      address_line: input.addressLine, city: input.city, postal_code: input.postalCode,
      is_default: input.isDefault ?? false,
    })
    .eq("id", id)
    .eq("profile_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account/addresses");
  return { ok: true };
}

/** Buyer: delete an address they own. */
export async function deleteAddress(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { error } = await supabase
    .from("buyer_addresses").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account/addresses");
  return { ok: true };
}

/** Buyer: mark one address as the default (unsets any other). */
export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  await supabase.from("buyer_addresses").update({ is_default: false }).eq("profile_id", user.id);
  const { error } = await supabase
    .from("buyer_addresses").update({ is_default: true }).eq("id", id).eq("profile_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account/addresses");
  return { ok: true };
}
