"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { sendMessage } from "./actions";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Near-real-time: refresh the thread periodically to pull new messages.
  const savedRefresh = useRef(() => router.refresh());
  savedRefresh.current = () => router.refresh();
  useEffect(() => {
    const t = setInterval(() => savedRefresh.current(), 6000);
    return () => clearInterval(t);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = value.trim();
    if (!body || sending) return;
    setSending(true);
    setNotice(null);
    const res = await sendMessage(conversationId, body);
    setSending(false);
    if (res.ok) {
      setValue("");
      if (res.blocked) {
        setNotice(
          `Your message was hidden — it looked like it shared ${res.reasons?.join(", ") ?? "contact details"}. Keep deals on-platform to stay protected.`,
        );
      }
      router.refresh();
    } else {
      setNotice(res.error ?? "Could not send.");
    }
  };

  return (
    <div className="border-t border-border p-3">
      {notice && (
        <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{notice}</p>
      )}
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          disabled={sending || !value.trim()}
          aria-label="Send"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
      <p className="mt-2 px-1 text-[11px] text-muted-foreground">
        For your safety, sharing phone numbers, emails or external links is blocked. Keep payment in escrow on-platform.
      </p>
    </div>
  );
}
