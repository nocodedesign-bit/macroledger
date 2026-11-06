import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
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
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => { if (!done) { done = true; setChecking(false); } };
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") { setRecovery(true); finish(); }
    });
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const isRecovery =
        window.location.hash.includes("type=recovery") ||
        data.session?.user?.app_metadata?.provider === "recovery";
      if (isRecovery) setRecovery(true);
      finish();
    })();
    const timer = setTimeout(finish, 4000);
    return () => { clearTimeout(timer); sub.subscription.unsubscribe(); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else void navigate({ to: "/fedwatch", replace: true });
  };

  return (
    <div className="auth-page min-h-dvh bg-background text-foreground">
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-8 px-5 py-10 sm:px-6">
        <div aria-label="Macro Ledger" className="text-2xl font-semibold">
          <span className="text-primary">MACRO</span><span className="font-medium text-foreground"> LEDGER</span>
        </div>
        <section className="w-full min-w-0 rounded-2xl border border-border bg-card px-6 py-9 sm:px-9 sm:py-10">
          <h1 className="text-center text-2xl font-bold leading-snug">Set your password</h1>
          <p className="mt-3 text-center text-sm leading-6 text-muted-foreground">Choose a new password for your Macro Ledger account.</p>
          {checking ? (
            <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="motion-safe:animate-spin" /> Checking your reset link…
            </p>
          ) : recovery ? (
            <form className="mt-8 space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" required minLength={6} maxLength={72} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" required minLength={6} maxLength={72} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" />
              </div>
              {error && <p role="alert" className="text-sm text-negative">{error}</p>}
              <Button className="h-11 w-full font-semibold" disabled={busy}>
                {busy && <LoaderCircle className="motion-safe:animate-spin" />} Save password
              </Button>
            </form>
          ) : (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm text-muted-foreground">This reset link is no longer valid. Open the newest link we emailed you, or request a new one.</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Back to sign in</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
