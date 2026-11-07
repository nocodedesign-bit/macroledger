import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, UserRound, Upload, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/google-sign-in";
import type { Json } from "@/integrations/supabase/types";
import { ledgerFields, ledgerKeys } from "@/lib/ledger-catalog";

export function AccountMenu({ iconOnly = false }: { iconOnly?: boolean }) {
  const { user, ready } = useAccount();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localCount, setLocalCount] = useState(0);
  const profile = useQuery({ queryKey: ["profile", user?.id], enabled: !!user, queryFn: async () => {
    if (!user) return null;
    const { data, error } = await supabase.from("profiles").select("display_name,avatar_url").eq("id", user.id).single();
    if (error) throw error;
    return data;
  } });
  useEffect(() => { setName(profile.data?.display_name ?? ""); }, [profile.data]);
  useEffect(() => {
    let count = 0;
    for (const key of ledgerKeys) {
      try { const rows = JSON.parse(localStorage.getItem(key) ?? "[]"); if (Array.isArray(rows)) count += rows.length; } catch { /* preserve unreadable data */ }
    }
    setLocalCount(count);
  }, [open]);
  const signIn = async () => {
    setBusy(true);
    try {
      const result = await signInWithGoogle();
      if (!result.redirected) setOpen(false);
    } catch { toast.error("Google sign-in failed. Please try again."); }
    finally { setBusy(false); }
  };
  const importEntries = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const rows: { user_id: string; ledger_key: string; record_date: string; data: Json }[] = [];
      for (const key of ledgerKeys) {
        const entries: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
        if (!Array.isArray(entries)) throw new Error("Invalid browser ledger");
        for (const entry of entries) {
          if (!entry || typeof entry !== "object" || typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) throw new Error("Invalid browser record");
          const fields = ledgerFields[key];
          if (fields.some((field) => typeof entry[field] !== "number" || !Number.isFinite(entry[field]))) throw new Error("Invalid browser values");
          rows.push({ user_id: user.id, ledger_key: key, record_date: entry.date, data: entry as Json });
        }
      }
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from("ledger_entries").upsert(rows.slice(i, i + 500), { onConflict: "user_id,ledger_key,record_date", ignoreDuplicates: true });
        if (error) throw error;
      }
      await queryClient.invalidateQueries({ queryKey: ["ledger", user.id] });
      toast.success("Browser entries imported. Existing online entries were kept.");
    } catch { toast.error("Import failed. Your browser entries are still safe; you can retry."); }
    finally { setBusy(false); }
  };
  return <>
    <Button variant={iconOnly ? "secondary" : "ghost"} aria-label={user ? "My account" : "Sign in"} title={user ? "My account" : "Sign in"} className={iconOnly ? "h-10 w-10 shrink-0 rounded-full p-0 text-muted-foreground [&_svg]:size-5 sm:h-11 sm:w-11" : "ml-auto shrink-0"} disabled={!ready} onClick={() => setOpen(true)}>
      {iconOnly || user ? <UserRound /> : <LogIn />}{!iconOnly && <span className="hidden sm:inline">{user ? "My account" : "Sign in"}</span>}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className={iconOnly ? "ledger-app" : undefined}><DialogHeader><DialogTitle>{user ? "My account" : "Sign in to Macro Ledger"}</DialogTitle></DialogHeader>
      {user ? <div className="space-y-5">
        <p className="break-all text-sm text-muted-foreground">{user.email}</p>
        {profile.error && <p role="alert" className="text-sm text-negative">Could not load your profile.</p>}
        <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const { error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", user.id); setBusy(false); if (error) toast.error("Could not save profile"); else { await queryClient.invalidateQueries({ queryKey: ["profile", user.id] }); toast.success("Profile saved"); } }}>
          <Label htmlFor="profile-name">Display name</Label><Input id="profile-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /><Button disabled={busy || profile.isPending}>Save profile</Button>
        </form>
        <form className="space-y-3 border-t border-border pt-4" onSubmit={async (event) => {
          event.preventDefault();
          if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
          if (password !== confirm) { toast.error("Passwords do not match"); return; }
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password });
          setBusy(false);
          if (error) toast.error("Could not change password. Please sign in again and retry.");
          else { setPassword(""); setConfirm(""); toast.success("Password changed"); }
        }}>
          <Label htmlFor="new-password">Change password</Label>
          <Input id="new-password" type="password" autoComplete="new-password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input id="confirm-password" type="password" autoComplete="new-password" placeholder="Confirm new password" aria-label="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <Button variant="outline" disabled={busy || !password}>Update password</Button>
        </form>
        {localCount > 0 && <div className="space-y-3 border-t border-border pt-4"><p className="text-sm text-muted-foreground">{localCount} entries are saved in this browser. Import them into this account without replacing online entries.</p><Button variant="outline" disabled={busy} onClick={importEntries}><Upload />Import browser entries</Button></div>}
        <Button variant="outline" disabled={busy} onClick={async () => { setBusy(true); await queryClient.cancelQueries(); queryClient.clear(); const { error } = await supabase.auth.signOut(); setBusy(false); if (error) toast.error("Could not sign out"); else { setOpen(false); toast.success("Signed out"); } }}><LogOut />Sign out</Button>
      </div> : <div className="space-y-5"><p className="text-sm text-muted-foreground">Your market entries and profile are private to your account.</p><Button className="w-full" disabled={busy} onClick={signIn}>{busy ? <LoaderCircle className="animate-spin" /> : <LogIn />}Continue with Google</Button></div>}
    </DialogContent></Dialog>
  </>;
}