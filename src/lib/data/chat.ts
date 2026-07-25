import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export type ChatScope = "buyer" | "seller" | "admin";

export interface ConversationView {
  id: string;
  productTitle: string | null;
  productSlug: string | null;
  otherParty: string;
  lastMessageAt: string;
  unread: number;
}

/** Map of conversationId → unread count for the current user. */
export async function getUnreadMap(): Promise<Record<string, number>> {
  const supabase = await createClient();
  if (!supabase) return {};
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { data } = await supabase.rpc("my_unread");
  const map: Record<string, number> = {};
  for (const row of (data ?? []) as { conversation_id: string; unread: number }[]) {
    map[row.conversation_id] = Number(row.unread);
  }
  return map;
}

export async function getUnreadTotal(): Promise<number> {
  const map = await getUnreadMap();
  return Object.values(map).reduce((a, b) => a + b, 0);
}

export interface MessageView {
  id: string;
  body: string;
  blocked: boolean;
  mine: boolean;
  senderName: string;
  createdAt: string;
}

export interface ThreadView {
  id: string;
  productTitle: string | null;
  productSlug: string | null;
  buyerName: string;
  sellerName: string;
  scope: ChatScope;
  canSend: boolean;
  messages: MessageView[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** List conversations for the current user in the given scope. */
export async function listConversations(scope: ChatScope): Promise<ConversationView[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const base =
    "id, product_title, product_slug, last_message_at, buyer:profiles!conversations_buyer_id_fkey(full_name,email), seller:sellers(name)";

  let query = supabase.from("conversations").select(base).order("last_message_at", { ascending: false });
  if (scope === "buyer") query = query.eq("buyer_id", user.id);
  // seller + admin rely on RLS to scope rows (seller sees own, admin sees all).

  const { data } = await query;
  const unreadMap = scope === "admin" ? {} : await getUnreadMap();
  return (data ?? []).map((c: any) => {
    const buyer = Array.isArray(c.buyer) ? c.buyer[0] : c.buyer;
    const seller = Array.isArray(c.seller) ? c.seller[0] : c.seller;
    const buyerName = buyer?.full_name || buyer?.email || "Buyer";
    const sellerName = seller?.name || "Seller";
    const otherParty =
      scope === "buyer" ? sellerName : scope === "seller" ? buyerName : `${buyerName} ↔ ${sellerName}`;
    return {
      id: c.id, productTitle: c.product_title, productSlug: c.product_slug,
      otherParty, lastMessageAt: c.last_message_at, unread: unreadMap[c.id] ?? 0,
    };
  });
}

/** Load a single thread. Admins see original blocked text; participants don't. */
export async function getThread(conversationId: string, scope: ChatScope): Promise<ThreadView | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const me = await getSessionUser();
  if (!me) return null;

  const { data: convo } = await supabase
    .from("conversations")
    .select("id, product_title, product_slug, buyer_id, seller_id, buyer:profiles!conversations_buyer_id_fkey(full_name,email), seller:sellers(name)")
    .eq("id", conversationId)
    .maybeSingle();
  if (!convo) return null; // RLS blocks non-participants/non-admins

  const buyer = Array.isArray((convo as any).buyer) ? (convo as any).buyer[0] : (convo as any).buyer;
  const seller = Array.isArray((convo as any).seller) ? (convo as any).seller[0] : (convo as any).seller;
  const buyerName = buyer?.full_name || buyer?.email || "Buyer";
  const sellerName = seller?.name || "Seller";

  const { data: rows } = await supabase
    .from("messages")
    .select("id, sender_id, body, blocked, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  // Admin: fetch original text of blocked messages for the audit view.
  let originals: Record<string, string> = {};
  if (scope === "admin") {
    const blockedIds = (rows ?? []).filter((r: any) => r.blocked).map((r: any) => r.id);
    if (blockedIds.length) {
      const { data: flags } = await supabase
        .from("message_flags").select("message_id, original_body").in("message_id", blockedIds);
      originals = Object.fromEntries((flags ?? []).map((f: any) => [f.message_id, f.original_body]));
    }
  }

  const messages: MessageView[] = (rows ?? []).map((m: any) => ({
    id: m.id,
    body: scope === "admin" && m.blocked && originals[m.id] ? originals[m.id] : m.body,
    blocked: m.blocked,
    mine: m.sender_id === me.id,
    senderName: m.sender_id === (convo as any).buyer_id ? buyerName : sellerName,
    createdAt: m.created_at,
  }));

  return {
    id: convo.id,
    productTitle: convo.product_title,
    productSlug: convo.product_slug,
    buyerName, sellerName, scope,
    canSend: scope !== "admin",
    messages,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
