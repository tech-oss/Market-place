import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Server Supabase client bound to the request cookies (RSC / server actions).
 * Returns null when Supabase isn't configured so callers can fall back to mocks.
 *
 * Wrapped in React's `cache()` so every call within the same request/render
 * pass reuses the same client instance — this matters because `getUser()`
 * (below) hits Supabase's Auth API over the network on every call, and a
 * single dashboard page easily calls it half a dozen times (layout +
 * several data-layer functions each resolving "who's signed in").
 */
export const createClient = cache(async () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore; middleware refreshes.
        }
      },
    },
  });
});

/**
 * The signed-in Supabase auth user for this request, memoized so the
 * network round-trip to Auth only happens once no matter how many
 * data-layer functions need "who's signed in" during the same render.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
