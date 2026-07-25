import Link from "next/link";
import { ArrowLeft, EyeOff, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThreadView } from "@/lib/data/chat";
import { MessageComposer } from "./message-composer";

export function ChatThread({ thread, backHref }: { thread: ThreadView; backHref: string }) {
  const isAdmin = thread.scope === "admin";

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link href={backHref} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted lg:hidden">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {isAdmin ? `${thread.buyerName} ↔ ${thread.sellerName}` : thread.scope === "buyer" ? thread.sellerName : thread.buyerName}
          </p>
          {thread.productTitle && (
            <p className="truncate text-xs text-muted-foreground">
              {thread.productSlug ? (
                <Link href={`/parts/${thread.productSlug}`} className="hover:text-brand">Re: {thread.productTitle}</Link>
              ) : <>Re: {thread.productTitle}</>}
            </p>
          )}
        </div>
        {isAdmin && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
            <ShieldAlert className="size-3" /> Audit view
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
        {thread.messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No messages yet — say hello 👋
          </p>
        )}
        {thread.messages.map((m) => {
          const mine = m.mine;
          return (
            <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              {isAdmin && (
                <span className="mb-0.5 text-[10px] font-medium text-muted-foreground">{m.senderName}</span>
              )}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm",
                  m.blocked
                    ? "border border-amber-200 bg-amber-50 text-amber-900"
                    : mine
                      ? "bg-brand text-brand-foreground"
                      : "bg-white text-foreground shadow-sm",
                )}
              >
                {m.blocked && !isAdmin && (
                  <span className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold">
                    <EyeOff className="size-3" /> Hidden
                  </span>
                )}
                {m.blocked && isAdmin && (
                  <span className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                    <ShieldAlert className="size-3" /> Flagged — original shown
                  </span>
                )}
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer or read-only note */}
      {thread.canSend ? (
        <MessageComposer conversationId={thread.id} />
      ) : (
        <p className="border-t border-border p-3 text-center text-xs text-muted-foreground">
          Read-only audit view — admins cannot post in conversations.
        </p>
      )}
    </div>
  );
}
