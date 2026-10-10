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
import { lovable } from "@/integrations/lovable/index";
import type { Json } from "@/integrations/supabase/types";

export function AccountMenu() {
  const { user, ready } = useAccount();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
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
    for (const key of ["ledger:fedwatch", "ledger:ecbwatch", "ledger:dxy-exy"]) {
      try { const rows = JSON.parse(localStorage.getItem(key) ?? "[]"); if (Array.isArray(rows)) count += rows.length; } catch { /* preserve unreadable data */ }
    }
    setLocalCount(count);
  }, [open]);
  const signIn = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) setOpen(false);
    } catch { toast.error("Google sign-in failed. Please try again."); }
    finally { setBusy(false); }
  };
  const importEntries = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const rows: { user_id: string; ledger_key: string; record_date: string; data: Json }[] = [];
      for (const key of ["ledger:fedwatch", "ledger:ecbwatch", "ledger:dxy-exy"]) {
        const entries: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
        if (!Array.isArray(entries)) throw new Error("Invalid browser ledger");
        for (const entry of entries) {
          if (!entry || typeof entry !== "object" || typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) throw new Error("Invalid browser record");
          const fields = key !== "ledger:dxy-exy" ? ["cut", "hold", "hike"] : ["dxy", "exy"];
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
    <Button variant="ghost" className="ml-auto shrink-0" disabled={!ready} onClick={() => setOpen(true)}>
      {user ? <UserRound /> : <LogIn />}<span className="hidden sm:inline">{user ? "My account" : "Sign in"}</span>
    </Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{user ? "My account" : "Sign in to Macro Ledger"}</DialogTitle></DialogHeader>
      {user ? <div className="space-y-5">
        <p className="break-all text-sm text-muted-foreground">{user.email}</p>
        {profile.error && <p role="alert" className="text-sm text-negative">Could not load your profile.</p>}
        <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const { error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", user.id); setBusy(false); if (error) toast.error("Could not save profile"); else { await queryClient.invalidateQueries({ queryKey: ["profile", user.id] }); toast.success("Profile saved"); } }}>
          <Label htmlFor="profile-name">Display name</Label><Input id="profile-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /><Button disabled={busy || profile.isPending}>Save profile</Button>
        </form>
        {localCount > 0 && <div className="space-y-3 border-t border-border pt-4"><p className="text-sm text-muted-foreground">{localCount} entries are saved in this browser. Import them into this account without replacing online entries.</p><Button variant="outline" disabled={busy} onClick={importEntries}><Upload />Import browser entries</Button></div>}
        <Button variant="outline" disabled={busy} onClick={async () => { await queryClient.cancelQueries(); queryClient.clear(); const { error } = await supabase.auth.signOut(); if (error) toast.error("Could not sign out"); else setOpen(false); }}><LogOut />Sign out</Button>
      </div> : <div className="space-y-5"><p className="text-sm text-muted-foreground">Your market entries and profile are private to your account.</p><Button className="w-full" disabled={busy} onClick={signIn}>{busy ? <LoaderCircle className="animate-spin" /> : <LogIn />}Continue with Google</Button></div>}
    </DialogContent></Dialog>
  </>;
}