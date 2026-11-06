import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set your password — Macro Ledger" },
      { name: "description", content: "Choose a new password for your Macro Ledger account." },
      { property: "og:title", content: "Set your password — Macro Ledger" },
      { property: "og:description", content: "Choose a new password for your Macro Ledger account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message); else void navigate({ to: "/fedwatch", replace: true });
  };
  return (
    <div className="auth-page min-h-dvh bg-background text-foreground">
      <main className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-5">
        <form onSubmit={submit} className="w-full space-y-4 rounded-2xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Set your password</h1>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" required minLength={6} maxLength={72} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-negative">{error}</p>}
          <Button className="w-full" disabled={busy}>Save password</Button>
        </form>
      </main>
    </div>
  );
}
