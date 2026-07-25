import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { timeAgo } from "@/lib/format";
import type { ConversationView } from "@/lib/data/chat";

export function ConversationList({
  conversations,
  basePath,
  emptyHint,
}: {
  conversations: ConversationView[];
  basePath: string;
  emptyHint: string;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <MessageSquare className="size-6" />
        </span>
        <p className="mt-4 font-semibold text-foreground">No conversations yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {conversations.map((c) => (
        <li key={c.id}>
          <Link href={`${basePath}/${c.id}`} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-neutral-50">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">
              {c.otherParty.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{c.otherParty}</p>
              <p className="truncate text-sm text-muted-foreground">{c.productTitle ?? "General enquiry"}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
              {timeAgo(c.lastMessageAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
