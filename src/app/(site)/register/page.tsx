"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState } from "react";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/layout/logo";
import { signUp, type AuthState } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const initialRole = useSearchParams().get("role") === "seller" ? "seller" : "buyer";
  const [role, setRole] = useState<"buyer" | "seller">(initialRole);
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-bold text-foreground">Create your account</h1>

          {/* Role toggle */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            {(["buyer", "seller"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-md py-1.5 text-sm font-medium capitalize transition-colors",
                  role === r ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {r === "buyer" ? "Buy parts" : "Sell parts"}
              </button>
            ))}
          </div>

          <form action={action} className="mt-4 space-y-4">
            <input type="hidden" name="role" value={role} />
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Full name</label>
              <input name="fullName" required className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Email</label>
              <input name="email" type="email" required className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Password</label>
              <input name="password" type="password" required minLength={6} className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            {role === "seller" && (
              <p className="rounded-lg bg-neutral-100 px-3 py-2 text-xs text-muted-foreground">
                After signing up you&rsquo;ll complete your business profile and upload your ID &
                proof of residence for verification.
              </p>
            )}
            {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>}
            <button disabled={pending} className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
              {pending ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </Container>
  );
}
