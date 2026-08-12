import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Cancels EFT orders whose 3-day payment deadline has passed without a
 * submitted proof (orders with proof already uploaded are left for admin
 * review rather than auto-cancelled — see expire_eft_orders() in
 * supabase/migrations/0023_eft_payments.sql), restoring reserved stock.
 *
 * Triggered by Vercel Cron (see vercel.json). If CRON_SECRET is set, the
 * request must carry a matching `Authorization: Bearer <secret>` header —
 * Vercel Cron adds this automatically when the env var is present.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ ok: true, cancelled: 0, note: "Supabase not configured" });

  const { data, error } = await supabase.rpc("expire_eft_orders");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, cancelled: data ?? 0 });
}
