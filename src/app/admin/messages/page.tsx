import { PageHeading } from "@/features/dashboard/ui";
import { listConversations } from "@/lib/data/chat";
import { ConversationList } from "@/features/chat/conversation-list";

export default async function AdminMessagesPage() {
  const conversations = await listConversations("admin");
  return (
    <>
      <PageHeading
        title="Conversations"
        description="Full audit log of buyer ↔ seller communication on the platform."
      />
      <ConversationList
        conversations={conversations}
        basePath="/admin/messages"
        emptyHint="Conversations between buyers and sellers will appear here."
      />
    </>
  );
}
