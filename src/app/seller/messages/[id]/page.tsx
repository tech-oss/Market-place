import { notFound } from "next/navigation";
import { getThread } from "@/lib/data/chat";
import { markConversationRead } from "@/features/chat/actions";
import { ChatThread } from "@/features/chat/chat-thread";

export default async function SellerThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await getThread(id, "seller");
  if (!thread) notFound();
  await markConversationRead(id);
  return <ChatThread thread={thread} backHref="/seller/messages" />;
}
