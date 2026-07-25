"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { getUnreadTotalAction } from "@/features/chat/actions";

/**
 * Lightweight polling notifier: checks the unread total every 15s and pops a
 * toast (and refreshes badges) when it increases. No websockets needed.
 */
export function MessagesNotifier({ initialUnread }: { initialUnread: number }) {
  const router = useRouter();
  const last = useRef(initialUnread);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const n = await getUnreadTotalAction();
        if (!active) return;
        if (n > last.current) {
          setToast(true);
          router.refresh(); // update server-rendered badges
          window.setTimeout(() => active && setToast(false), 6000);
        }
        last.current = n;
      } catch {
        /* ignore transient errors */
      }
    };
    const id = window.setInterval(tick, 15000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [router]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60] w-72 rounded-xl border border-border bg-white p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
          <MessageSquare className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">New message</p>
          <p className="text-xs text-muted-foreground">You have a new message in your inbox.</p>
          <Link
            href="/messages"
            onClick={() => setToast(false)}
            className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
          >
            View messages →
          </Link>
        </div>
        <button onClick={() => setToast(false)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
