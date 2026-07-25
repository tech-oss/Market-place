import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { getSessionUser } from "@/lib/auth";
import { getThread } from "@/lib/data/chat";
import { ChatThread } from "@/features/chat/chat-thread";

export const metadata: Metadata = { title: "Conversation", robots: { index: false } };

export default async function BuyerThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getSessionUser();
  const { id } = await params;
  if (!me) redirect(`/login?next=/messages/${id}`);

  const thread = await getThread(id, "buyer");
  if (!thread) notFound();

  return (
    <Container className="py-6">
      <ChatThread thread={thread} backHref="/messages" />
    </Container>
  );
}
