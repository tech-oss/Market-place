import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { getSessionUser } from "@/lib/auth";
import { listConversations } from "@/lib/data/chat";
import { ConversationList } from "@/features/chat/conversation-list";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default async function BuyerMessagesPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/messages");

  const conversations = await listConversations("buyer");
  return (
    <>
      <PageHeader title="Messages" crumbs={[{ label: "Home", href: "/" }, { label: "Messages" }]} />
      <Container className="py-8">
        <ConversationList
          conversations={conversations}
          basePath="/messages"
          emptyHint="Message a seller from any product page to start a conversation."
        />
      </Container>
    </>
  );
}
