import { notFound } from "next/navigation";
import { getThread } from "@/lib/data/chat";
import { ChatThread } from "@/features/chat/chat-thread";

export default async function AdminThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await getThread(id, "admin");
  if (!thread) notFound();
  return <ChatThread thread={thread} backHref="/admin/messages" />;
}
