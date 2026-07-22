"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar({
  className,
  onSubmitted,
}: {
  className?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/parts?q=${encodeURIComponent(q)}` : "/parts");
        onSubmitted?.();
      }}
      className={cn("relative", className)}
    >
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search parts, brands, bikes…"
        aria-label="Search"
        className="h-10 rounded-full bg-muted pl-9"
      />
    </form>
  );
}
