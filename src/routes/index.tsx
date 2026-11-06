import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Macro Ledger" },
      { name: "description", content: "Register or sign in with email to access your private daily macro ledgers and market rate trackers." },
      { property: "og:title", content: "Sign in — Macro Ledger" },
      { property: "og:description", content: "Register or sign in with email to access your private daily macro ledgers and market rate trackers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, ready } = useAccount();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "signin">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (ready && user) void navigate({ to: "/fedwatch", replace: true });
  }, [ready, user, navigate]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page min-h-dvh bg-background text-foreground">
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-8 px-5 py-10 sm:px-6">
        <div aria-label="Macro Ledger" className="text-2xl font-semibold">
          <span className="text-primary">MACRO</span><span className="font-medium text-foreground"> LEDGER</span>
        </div>
        <section className="w-full min-w-0 rounded-2xl border border-border bg-card px-6 py-9 sm:px-9 sm:py-10">
          <h1 className="text-center text-2xl font-bold leading-snug">{mode === "register" ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-3 text-center text-sm leading-6 text-muted-foreground">Access your private daily macro ledgers and market rate trackers.</p>
          {sent ? (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm text-muted-foreground">We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to activate your account, then sign in.</p>
              <Button variant="outline" className="w-full" onClick={() => { setSent(false); setMode("signin"); }}>Back to sign in</Button>
            </div>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required maxLength={255} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} maxLength={72} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              {error && <p role="alert" className="text-sm text-negative">{error}</p>}
              <Button className="h-11 w-full font-semibold" disabled={!ready || busy || !!user}>
                {(busy || user) && <LoaderCircle className="motion-safe:animate-spin" />}
                {user ? "Opening your ledgers…" : mode === "register" ? "Register" : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {mode === "register" ? "Already have an account?" : "New to Macro Ledger?"}{" "}
                <button type="button" className="font-medium text-primary hover:underline" onClick={() => { setMode(mode === "register" ? "signin" : "register"); setError(""); }}>
                  {mode === "register" ? "Sign in" : "Register"}
                </button>
              </p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
