"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/layout/logo";
import { signIn, type AuthState } from "@/features/auth/actions";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const next = useSearchParams().get("next") ?? "/account";
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account.</p>

          <form action={action} className="mt-5 space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Email</label>
              <input name="email" type="email" required className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Password</label>
              <input name="password" type="password" required className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>}
            <button disabled={pending} className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&rsquo;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline">Create one</Link>
        </p>
      </div>
    </Container>
  );
}
