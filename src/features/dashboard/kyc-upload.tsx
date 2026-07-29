"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { setKycDocPath } from "@/features/dashboard/actions";

export function KycUpload({
  kind,
  label,
  uploaded: initialUploaded,
}: {
  kind: "id" | "proof" | "banking";
  label: string;
  uploaded: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState(initialUploaded);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setError("Storage isn't connected yet.");
      return;
    }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setError("Please sign in again.");
      return;
    }
    const ext = file.name.split(".").pop() || "dat";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("kyc-documents")
      .upload(path, file, { upsert: true });
    if (upErr) {
      setBusy(false);
      setError(upErr.message);
      return;
    }
    const res = await setKycDocPath(kind, path);
    setBusy(false);
    if (res.ok) setUploaded(true);
    else setError(res.error ?? "Could not save document.");
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {uploaded ? "Uploaded — awaiting review" : "PDF, JPG or PNG"}
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      {uploaded ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-600">
          <CheckCircle2 className="size-4" /> Done
        </span>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {busy ? "Uploading…" : "Upload"}
        </button>
      )}
    </div>
  );
}
