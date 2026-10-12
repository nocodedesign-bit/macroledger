import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMark } from "@/components/google-mark";
import { useAccount } from "@/hooks/use-account";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Macro Ledger" },
      { name: "description", content: "Sign in with Google to access your private daily macro ledgers and market rate trackers." },
      { property: "og:title", content: "Sign in — Macro Ledger" },
      { property: "og:description", content: "Sign in with Google to access your private daily macro ledgers and market rate trackers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, ready } = useAccount();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (ready && user) void navigate({ to: "/fedwatch", replace: true });
  }, [ready, user, navigate]);
  const signIn = async () => {
    setBusy(true);
    setError("");
    try {
      // Cloud's managed Google flow sets the session; return to this public page
      // before the shared account provider redirects into the app.
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (result.redirected) return;
    } catch {
      setError("Google sign-in could not be completed. Please try again.");
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
        <section aria-label="Sign in to Macro Ledger" className="w-full min-w-0 rounded-2xl border border-border bg-card px-6 py-9 text-center sm:px-9 sm:py-10">
          <h1 className="text-2xl font-bold leading-snug">Welcome to Macro Ledger</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Sign in with Google to access your private daily macro ledgers and market rate trackers.</p>
          <Button variant="google" className="mt-8 h-12 w-full gap-3 text-sm font-semibold [&_svg]:size-5" disabled={!ready || busy || !!user} onClick={signIn}>
            {busy || !ready || user ? <LoaderCircle className="motion-safe:animate-spin" /> : <GoogleMark />}
            {busy ? "Connecting to Google…" : user ? "Opening your ledgers…" : "Continue with Google"}
          </Button>
          {error && <p role="alert" className="mt-4 text-sm text-negative">{error}</p>}
        </section>
      </main>
    </div>
  );
}
