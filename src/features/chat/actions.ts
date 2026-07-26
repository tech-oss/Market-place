"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { moderateMessage, BLOCKED_PLACEHOLDER } from "./moderation";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ConversationResult =
  | { kind: "self" }
  | { kind: "ok"; id: string }
  | { kind: "fail" };

/**
 * Look up (or create) the conversation for this product/buyer, without ever
 * calling redirect() itself — redirect() throws internally as Next.js's
 * control-flow signal, so it must never be called inside a try/catch that
 * might mistake that throw for a real error and swallow it.
 */
async function resolveConversation(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  userId: string,
  productId: string,
): Promise<ConversationResult> {
  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, title, slug, seller_id, seller:sellers(profile_id)")
      .eq("id", productId)
      .maybeSingle();
    if (productError || !product) return { kind: "fail" };

    const sellerProfile = Array.isArray((product as any).seller)
      ? (product as any).seller[0]?.profile_id
      : (product as any).seller?.profile_id;
    // Don't let a seller open a chat with themselves.
    if (sellerProfile && sellerProfile === userId) return { kind: "self" };

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("product_id", product.id)
      .eq("buyer_id", userId)
      .eq("seller_id", product.seller_id)
      .maybeSingle();

    let conversationId = existing?.id as string | undefined;
    if (!conversationId) {
      const { data: created, error: createError } = await supabase
        .from("conversations")
        .insert({
          product_id: product.id,
          product_title: product.title,
          product_slug: product.slug,
          buyer_id: userId,
          seller_id: product.seller_id,
        })
        .select("id")
        .single();
      if (createError || !created) return { kind: "fail" };
      conversationId = created.id;
    }
    if (!conversationId) return { kind: "fail" };

    return { kind: "ok", id: conversationId };
  } catch {
    return { kind: "fail" };
  }
}

/** Product-page "Contact seller": get-or-create a thread, then open it. */
export async function contactSeller(formData: FormData): Promise<void> {
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/parts/${slug}`)}`);

  // Demo/mock listings don't have a real seller to message — bail out
  // deterministically instead of sending a mock id into a uuid column.
  if (!UUID.test(productId)) redirect(`/parts/${slug}?contact=unavailable`);

  const result = await resolveConversation(supabase, user.id, productId);
  if (result.kind === "self") redirect("/seller/listings");
  if (result.kind === "ok") redirect(`/messages/${result.id}`);
  redirect(`/parts/${slug}?contact=error`);
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
