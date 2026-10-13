import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { todayISO, useLedger } from "@/hooks/use-ledger";
import { EcbWatchChart, type EcbEntry } from "@/components/ecbwatch-chart";
import { LedgerDatePicker } from "@/components/ledger-date-picker";
import { useAccount } from "@/hooks/use-account";
import { LedgerSummaryCard } from "@/components/ledger-summary-card";
import { LedgerInsights } from "@/components/ledger-insights";

export const Route = createFileRoute("/_app/ecb-watch")({
  head: () => ({
    meta: [
      { title: "Ecb Watch — Macro Ledger" },
      { name: "description", content: "Log daily ECB rate probabilities for the next ECB Governing Council meeting." },
      { property: "og:title", content: "Ecb Watch — Macro Ledger" },
      { property: "og:description", content: "Log daily ECB rate probabilities for the next ECB Governing Council meeting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EcbWatchPage,
});

function EcbWatchPage() {
  const { entries, upsert, remove, error } = useLedger<EcbEntry>("ledger:ecbwatch");
  const { user } = useAccount();
  const [saving, setSaving] = useState(false);
  const { entries: dollarCloses } = useLedger<{ date: string; dxy: number; exy: number }>("ledger:dxy-exy");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: todayISO(), ecbMeeting: "", cut: "", hold: "", hike: "", exy: "", de02y: "" });
  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.ecbMeeting) { toast.error("Select a record date and ECB meeting date"); return; }
    if (form.ecbMeeting < form.date) { toast.error("ECB meeting must be on or after the record date"); return; }
    const cut = Number(form.cut), hold = Number(form.hold), hike = Number(form.hike || 0);
    if ([cut, hold, hike].some((n) => isNaN(n) || n < 0 || n > 100)) { toast.error("Probabilities must be 0–100"); return; }
    const exy = form.exy.trim() === "" ? undefined : Number(form.exy);
    const de02y = form.de02y.trim() === "" ? undefined : Number(form.de02y);
    if ((exy !== undefined && (!Number.isFinite(exy) || exy <= 0)) || (de02y !== undefined && (!Number.isFinite(de02y) || de02y < 0))) { toast.error("Enter a positive EXY close and a non-negative DE02Y (Schatz) yield"); return; }
    setSaving(true);
    try { await upsert({ date: form.date, ecbMeeting: form.ecbMeeting, cut, hold, hike, exy, de02y }); toast.success("Entry logged"); setOpen(false); }
    catch { toast.error("Could not save entry. Please retry."); }
    finally { setSaving(false); }
  };

  return (
    <main className="ledger-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid grid-cols-1 items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">Ecb Watch</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Manual daily ledger of next-meeting ECB rate probabilities, correlated with EXY and German 2Y Schatz yields.</p>
        </div>
        <Button className="ledger-log h-12 w-full text-base font-semibold sm:w-auto sm:px-7 [&_svg]:size-5" disabled={!user} onClick={() => { setForm({ date: todayISO(), ecbMeeting: latest?.ecbMeeting && latest.ecbMeeting >= todayISO() ? latest.ecbMeeting : "", cut: "", hold: "", hike: "", exy: "", de02y: "" }); setOpen(true); }}>
          <Plus /> Log today
        </Button>
      </div>

      {!user && <p className="text-sm text-muted-foreground">Sign in to view and save your private ledger.</p>}
      {error && <p role="alert" className="text-sm text-negative">Could not load your entries. Please refresh to retry.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["cut", "hold", "hike"] as const).map((k) => {
          const d = latest && prev ? latest[k] - prev[k] : null;
          return (
            <LedgerSummaryCard key={k} label={k} value={latest ? `${latest[k].toFixed(1)}%` : "—"} change={d === null ? undefined : `${d >= 0 ? "+" : ""}${d.toFixed(1)} pts 1D`} />
          );
        })}
      </div>

      <EcbWatchChart entries={entries} dollarCloses={dollarCloses} />

      {user && <LedgerInsights defaultKey="ledger:ecbwatch" />}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">Record date</th><th className="px-4 py-3">ECB meeting</th><th className="px-4 py-3 text-right">Cut</th><th className="px-4 py-3 text-right">Hold</th><th className="px-4 py-3 text-right">Hike</th><th className="px-4 py-3 text-right">EXY</th><th className="px-4 py-3 text-right">DE02Y (Schatz)</th><th className="w-24" /></tr>
          </thead>
          <tbody className="font-mono">
            {entries.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center font-sans text-muted-foreground">No entries yet.</td></tr>}
            {[...entries].reverse().map((e) => (
              <tr key={e.date} className="border-t border-border">
                <td className="px-4 py-3">{e.date}</td>
                <td className="whitespace-nowrap px-4 py-3">{e.ecbMeeting ?? "—"}</td>
                <td className="px-4 py-3 text-right">{e.cut.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{e.hold.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{e.hike.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{(e.exy ?? dollarCloses.find((close) => close.date === e.date)?.exy)?.toFixed(3) ?? "—"}</td>
                <td className="px-4 py-3 text-right">{e.de02y === undefined ? "—" : `${e.de02y.toFixed(2)}%`}</td>
                <td className="whitespace-nowrap px-2"><Button variant="ghost" size="icon" aria-label={`Edit ${e.date}`} onClick={() => { setForm({ date: e.date, ecbMeeting: e.ecbMeeting ?? "", cut: String(e.cut), hold: String(e.hold), hike: String(e.hike), exy: e.exy === undefined ? "" : String(e.exy), de02y: e.de02y === undefined ? "" : String(e.de02y) }); setOpen(true); }}><Pencil /></Button><Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(e.date)}><Trash2 /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="ledger-app max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Log ECB probabilities</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="ecb-date" className="text-xs uppercase tracking-widest text-muted-foreground">Record date</Label><LedgerDatePicker id="ecb-date" label="Record date" value={form.date} onChange={(date) => setForm({ ...form, date })} /></div>
              <div className="space-y-2"><Label htmlFor="ecb-meeting" className="text-xs uppercase tracking-widest text-muted-foreground">ECB meeting</Label><LedgerDatePicker id="ecb-meeting" label="ECB meeting" value={form.ecbMeeting} onChange={(ecbMeeting) => setForm({ ...form, ecbMeeting })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["cut", "hold", "hike"] as const).map((k) => (
                <div key={k} className="space-y-2"><Label htmlFor={`ecb-${k}`} className="capitalize">{k} %</Label>
                  <Input id={`ecb-${k}`} type="number" step="0.1" required={k !== "hike"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="ecb-exy">EXY close (optional)</Label><Input id="ecb-exy" type="number" min="0" step="any" value={form.exy} onChange={(e) => setForm({ ...form, exy: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="ecb-de02y">DE02Y (Schatz) yield % (optional)</Label><Input id="ecb-de02y" type="number" min="0" step="any" value={form.de02y} onChange={(e) => setForm({ ...form, de02y: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save entry"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
