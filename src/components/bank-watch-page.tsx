import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { todayISO, useLedger } from "@/hooks/use-ledger";
import { BankWatchChart, type BankEntry } from "@/components/bank-watch-chart";
import { LedgerDatePicker } from "@/components/ledger-date-picker";
import { useAccount } from "@/hooks/use-account";
import { ProbabilityCard } from "@/components/probability-card";
import { LedgerInsights } from "@/components/ledger-insights";
import { EntryDateControls } from "@/components/entry-date-controls";

export function BankWatchPage({ bank, ledgerKey, indexName, indexKey, pairLedger, yieldName }: {
  bank: string; ledgerKey: string; indexName: string; indexKey: "bxy" | "jxy"; pairLedger: string; yieldName: string;
}) {
  const { entries, upsert, remove, error } = useLedger<BankEntry>(ledgerKey);
  const { user } = useAccount();
  const [saving, setSaving] = useState(false);
  const { entries: dollarCloses } = useLedger<{ date: string; dxy: number; bxy?: number; jxy?: number }>(pairLedger);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: todayISO(), meeting: "", cut: "", hold: "", hike: "", indexClose: "", bondYield: "" });
  const indexCloses = dollarCloses.flatMap((entry) => { const value = entry[indexKey]; return value === undefined ? [] : [{ date: entry.date, indexClose: value }]; });
  const [entryDate, setEntryDate] = useState("");
  const latest = entries[entries.length - 1];
  const shown = entryDate ? entries.filter((x) => x.date <= entryDate) : entries;
  const current = shown[shown.length - 1];
  const prev = shown[shown.length - 2];
  const top = current ? (["cut", "hold", "hike"] as const).reduce((a, b) => (current[b] > current[a] ? b : a)) : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.meeting) { toast.error(`Select a record date and ${bank} meeting date`); return; }
    if (form.meeting < form.date) { toast.error(`${bank} meeting must be on or after the record date`); return; }
    const cut = Number(form.cut), hold = Number(form.hold), hike = Number(form.hike || 0);
    if ([cut, hold, hike].some((n) => isNaN(n) || n < 0 || n > 100)) { toast.error("Probabilities must be 0–100"); return; }
    const indexClose = form.indexClose.trim() === "" ? undefined : Number(form.indexClose);
    const bondYield = form.bondYield.trim() === "" ? undefined : Number(form.bondYield);
    if ((indexClose !== undefined && (!Number.isFinite(indexClose) || indexClose <= 0)) || (bondYield !== undefined && !Number.isFinite(bondYield))) { toast.error(`Enter a positive ${indexName} close and a finite ${yieldName} yield`); return; }
    setSaving(true);
    try { await upsert({ date: form.date, meeting: form.meeting, cut, hold, hike, indexClose, bondYield }); toast.success("Entry logged"); setOpen(false); }
    catch { toast.error("Could not save entry. Please retry."); }
    finally { setSaving(false); }
  };

  return (
    <main className="ledger-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid grid-cols-1 items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">{bank} Watch</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Manual daily ledger of next-meeting {bank} rate probabilities, correlated with {indexName} and {yieldName} yields.</p>
        </div>
        <Button className="ledger-log h-12 w-full text-base font-semibold sm:w-auto sm:px-7 [&_svg]:size-5" disabled={!user} onClick={() => { setForm({ date: todayISO(), meeting: latest?.meeting && latest.meeting >= todayISO() ? latest.meeting : "", cut: "", hold: "", hike: "", indexClose: "", bondYield: "" }); setOpen(true); }}>
          <Plus /> Log today
        </Button>
      </div>

      <EntryDateControls value={entryDate} onChange={setEntryDate} updated={latest?.date} />
      {entryDate && current && current.date !== entryDate && <p className="text-xs text-muted-foreground">No entry on that date — showing {current.date}.</p>}

      {!user && <p className="text-sm text-muted-foreground">Sign in to view and save your private ledger.</p>}
      {error && <p role="alert" className="text-sm text-negative">Could not load your entries. Please refresh to retry.</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {(["cut", "hold", "hike"] as const).map((k) => (
          <ProbabilityCard key={k} kind={k} value={current?.[k]} change={current && prev ? current[k] - prev[k] : null} dominant={top === k} />
        ))}
      </div>

      <BankWatchChart entries={entries} dollarCloses={indexCloses} indexName={indexName} yieldName={yieldName} />

      {user && <LedgerInsights defaultKey={ledgerKey} />}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">Record date</th><th className="px-4 py-3">{bank} meeting</th><th className="px-4 py-3 text-right">Cut</th><th className="px-4 py-3 text-right">Hold</th><th className="px-4 py-3 text-right">Hike</th><th className="px-4 py-3 text-right">{indexName}</th><th className="px-4 py-3 text-right">{yieldName}</th><th className="w-24" /></tr>
          </thead>
          <tbody className="font-mono">
            {entries.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center font-sans text-muted-foreground">No entries yet.</td></tr>}
            {[...entries].reverse().map((e) => (
              <tr key={e.date} className="border-t border-border">
                <td className="px-4 py-3">{e.date}</td>
                <td className="whitespace-nowrap px-4 py-3">{e.meeting ?? "—"}</td>
                <td className="px-4 py-3 text-right">{e.cut.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{e.hold.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{e.hike.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{(e.indexClose ?? indexCloses.find((close) => close.date === e.date)?.indexClose)?.toFixed(3) ?? "—"}</td>
                <td className="px-4 py-3 text-right">{e.bondYield === undefined ? "—" : `${e.bondYield.toFixed(2)}%`}</td>
                <td className="whitespace-nowrap px-2"><Button variant="ghost" size="icon" aria-label={`Edit ${e.date}`} onClick={() => { setForm({ date: e.date, meeting: e.meeting ?? "", cut: String(e.cut), hold: String(e.hold), hike: String(e.hike), indexClose: e.indexClose === undefined ? "" : String(e.indexClose), bondYield: e.bondYield === undefined ? "" : String(e.bondYield) }); setOpen(true); }}><Pencil /></Button><Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(e.date)}><Trash2 /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="ledger-app max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Log {bank} probabilities</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="ecb-date" className="text-xs uppercase tracking-widest text-muted-foreground">Record date</Label><LedgerDatePicker id="ecb-date" label="Record date" value={form.date} onChange={(date) => setForm({ ...form, date })} /></div>
              <div className="space-y-2"><Label htmlFor="ecb-meeting" className="text-xs uppercase tracking-widest text-muted-foreground">{bank} meeting</Label><LedgerDatePicker id="ecb-meeting" label={`${bank} meeting`} value={form.meeting} onChange={(meeting) => setForm({ ...form, meeting })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["cut", "hold", "hike"] as const).map((k) => (
                <div key={k} className="space-y-2"><Label htmlFor={`ecb-${k}`} className="capitalize">{k} %</Label>
                  <Input id={`ecb-${k}`} type="number" step="0.1" required={k !== "hike"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="ecb-indexClose">{indexName} close (optional)</Label><Input id="ecb-indexClose" type="number" min="0" step="any" value={form.indexClose} onChange={(e) => setForm({ ...form, indexClose: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="ecb-bondYield">{yieldName} yield % (optional)</Label><Input id="ecb-bondYield" type="number" step="any" value={form.bondYield} onChange={(e) => setForm({ ...form, bondYield: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save entry"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
