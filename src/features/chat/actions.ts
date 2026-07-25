"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { moderateMessage, BLOCKED_PLACEHOLDER } from "./moderation";

/** Product-page "Contact seller": get-or-create a thread, then open it. */
export async function contactSeller(formData: FormData): Promise<void> {
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/parts/${slug}`)}`);

  const { data: product } = await supabase
    .from("products")
    .select("id, title, slug, seller_id, seller:sellers(profile_id)")
    .eq("id", productId)
    .maybeSingle();
  if (!product) redirect(`/parts/${slug}`);

  const sellerProfile = Array.isArray((product as any).seller)
    ? (product as any).seller[0]?.profile_id
    : (product as any).seller?.profile_id;
  // Don't let a seller open a chat with themselves.
  if (sellerProfile && sellerProfile === user!.id) redirect("/seller/listings");

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("product_id", product.id)
    .eq("buyer_id", user!.id)
    .eq("seller_id", product.seller_id)
    .maybeSingle();

  let conversationId = existing?.id as string | undefined;
  if (!conversationId) {
    const { data: created } = await supabase
      .from("conversations")
      .insert({
        product_id: product.id,
        product_title: product.title,
        product_slug: product.slug,
        buyer_id: user!.id,
        seller_id: product.seller_id,
      })
      .select("id")
      .single();
    conversationId = created?.id;
  }

  if (!conversationId) redirect(`/parts/${slug}`);
  redirect(`/messages/${conversationId}`);
}

/** Mark a conversation read for the current user (called when a thread opens). */
export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: convo } = await supabase
    .from("conversations").select("buyer_id").eq("id", conversationId).maybeSingle();
  if (!convo) return;

  const column = convo.buyer_id === user.id ? "buyer_last_read_at" : "seller_last_read_at";
  await supabase.from("conversations").update({ [column]: new Date().toISOString() }).eq("id", conversationId);
}

/** Poll target for the live notifier — total unread for the current user. */
export async function getUnreadTotalAction(): Promise<number> {
  const { getUnreadTotal } = await import("@/lib/data/chat");
  return getUnreadTotal();
}

export interface SendResult {
  ok: boolean;
  blocked?: boolean;
  reasons?: string[];
  error?: string;
}

/** Send a message; contact info is redacted before the other party sees it. */
export async function sendMessage(conversationId: string, rawBody: string): Promise<SendResult> {
  const body = rawBody.trim();
  if (!body) return { ok: false, error: "Empty message." };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Chat isn't connected." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { blocked, reasons } = moderateMessage(body);
  const deliverable = blocked ? BLOCKED_PLACEHOLDER : body;

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: deliverable, blocked })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  if (blocked) {
    await supabase.from("message_flags").insert({
      message_id: message.id, original_body: body, reasons,
    });
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath(`/seller/messages/${conversationId}`);
  revalidatePath(`/admin/messages/${conversationId}`);
  return { ok: true, blocked, reasons };
}
