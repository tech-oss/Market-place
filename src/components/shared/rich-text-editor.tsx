"use client";

import { useEffect, useRef } from "react";
import { Bold, Heading, Italic, List, ListOrdered, Quote, Strikethrough, Underline } from "lucide-react";
import { cn } from "@/lib/utils";

type Command = { icon: typeof Bold; label: string; cmd: string; arg?: string };

const COMMANDS: Command[][] = [
  [
    { icon: Bold, label: "Bold", cmd: "bold" },
    { icon: Italic, label: "Italic", cmd: "italic" },
    { icon: Underline, label: "Underline", cmd: "underline" },
    { icon: Strikethrough, label: "Strikethrough", cmd: "strikeThrough" },
  ],
  [
    { icon: Heading, label: "Heading", cmd: "formatBlock", arg: "h3" },
    { icon: List, label: "Bulleted list", cmd: "insertUnorderedList" },
    { icon: ListOrdered, label: "Numbered list", cmd: "insertOrderedList" },
    { icon: Quote, label: "Quote", cmd: "formatBlock", arg: "blockquote" },
  ],
];

/**
 * Small contentEditable rich-text editor for part descriptions.
 *
 * Uses document.execCommand: formally deprecated, but still the only
 * dependency-free way to get reliable formatting across browsers, and the
 * output is sanitised server-side anyway (see lib/rich-text).
 *
 * The editable div is uncontrolled — writing `value` back into it on every
 * keystroke would reset the caret to the start. It's seeded once on mount and
 * changes are pushed out via onChange.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Describe the part — condition, what's included, fitment notes…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || !ref.current) return;
    ref.current.innerHTML = value || "";
    seeded.current = true;
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  };

  // Paste as plain text so formatting (and markup) from other sites doesn't
  // come along for the ride.
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    onChange(ref.current?.innerHTML ?? "");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-input focus-within:ring-2 focus-within:ring-brand/30">
      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-neutral-50 px-2 py-1.5">
        {COMMANDS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1">
            {gi > 0 && <span className="mx-1 h-5 w-px bg-border" />}
            {group.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                aria-label={c.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => exec(c.cmd, c.arg)}
                className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <c.icon className="size-4" />
              </button>
            ))}
          </div>
        ))}
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        onBlur={() => onChange(ref.current?.innerHTML ?? "")}
        onPaste={onPaste}
        className={cn(
          "prose-description min-h-32 max-h-80 overflow-y-auto bg-background px-3 py-2 text-sm focus:outline-none",
          "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}
