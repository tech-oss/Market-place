"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
}

const NOT_CONFIGURED =
  "Authentication isn't connected yet. Add your Supabase environment variables to enable sign-in.";

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const role = formData.get("role") === "seller" ? "seller" : "buyer";
  const rawSellerType = String(formData.get("sellerType") ?? "individual");
  const sellerType = ["individual", "parts_dealer", "accessories_dealer"].includes(rawSellerType)
    ? rawSellerType
    : "individual";

  const metadata: Record<string, string> = { full_name: fullName, role };
  if (role === "seller") metadata.seller_type = sellerType;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  // New sellers land on verification (upload ID + proof of residence + banking); they may skip.
  // New buyers land on a quick, skippable profile/address step.
  redirect(role === "seller" ? "/seller/profile?welcome=1" : "/account/profile?welcome=1");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
