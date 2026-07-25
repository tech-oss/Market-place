import { PageHeading } from "@/features/dashboard/ui";
import { listConversations } from "@/lib/data/chat";
import { ConversationList } from "@/features/chat/conversation-list";

export default async function SellerMessagesPage() {
  const conversations = await listConversations("seller");
  return (
    <>
      <PageHeading title="Messages" description="Enquiries from buyers about your parts." />
      <ConversationList
        conversations={conversations}
        basePath="/seller/messages"
        emptyHint="When a buyer messages you about a listing, it appears here."
      />
    </>
  );
}
