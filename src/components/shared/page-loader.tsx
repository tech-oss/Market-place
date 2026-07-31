import { MpMark } from "@/components/layout/logo-mark";

/**
 * Branded full-page loader shown by Next.js while a route segment's data is
 * being fetched (see the sibling loading.tsx files). The gear behind the
 * MP mark spins continuously; a ring sweeps around it in the brand red, and
 * a slim indeterminate bar echoes the motion at the very top of the screen.
 */
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background/90 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-transparent">
        <div className="h-full w-1/3 animate-[loader-sweep_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-brand to-transparent" />
      </div>

      <div className="relative grid size-20 place-items-center">
        <svg
          viewBox="0 0 80 80"
          className="absolute inset-0 size-full animate-spin [animation-duration:1.4s]"
          fill="none"
        >
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="var(--color-brand)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="70 150"
          />
        </svg>
        <MpMark className="h-9 w-auto animate-pulse [animation-duration:1.4s]" />
      </div>

      <p className="animate-pulse text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Loading…
      </p>
    </div>
  );
}
