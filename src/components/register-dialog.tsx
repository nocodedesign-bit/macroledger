import { useState } from "react";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle as startGoogle } from "@/lib/google-sign-in";

export function RegisterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<"register" | "signin">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      const result = await startGoogle();
      if (!result.redirected) onOpenChange(false);
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Welcome to Macro Ledger!");
          onOpenChange(false);
        } else {
          setConfirmSent(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Signed in. Welcome back!");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "register" ? "Create your account" : "Sign in to Macro Ledger"}</DialogTitle>
        </DialogHeader>
        {confirmSent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Almost done! We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
              Click it to activate your account, then sign in.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setConfirmSent(false);
                setMode("signin");
              }}
            >
              Back to sign in
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <Button variant="outline" className="w-full" disabled={busy} onClick={signInWithGoogle}>
              {busy ? <LoaderCircle className="animate-spin" /> : <LogIn />}
              Continue with Google
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
            </div>
            <form className="space-y-3" onSubmit={submitEmail}>
              <div className="space-y-1.5">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <Button className="w-full" disabled={busy}>
                {busy ? <LoaderCircle className="animate-spin" /> : mode === "register" ? <UserPlus /> : <LogIn />}
                {mode === "register" ? "Create account" : "Sign in"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "register" ? "Already have an account?" : "New to Macro Ledger?"}{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => setMode(mode === "register" ? "signin" : "register")}
              >
                {mode === "register" ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
