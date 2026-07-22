import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Consistent typographic column for content/legal pages.
 * Styles headings, paragraphs and lists without needing @tailwindcss/typography.
 */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-[15px] leading-relaxed text-muted-foreground",
        "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground",
        "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
        "[&_a]:font-medium [&_a]:text-brand [&_a]:underline",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
