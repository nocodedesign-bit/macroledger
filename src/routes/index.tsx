import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { todayISO, useLedger } from "@/hooks/use-ledger";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FedWatch Tracker — Macro Ledger" },
      { name: "description", content: "Log daily FedWatch rate probabilities for the next FOMC meeting." },
      { property: "og:title", content: "FedWatch Tracker — Macro Ledger" },
      { property: "og:description", content: "Log daily FedWatch rate probabilities for the next FOMC meeting." },
    ],
  }),
  component: FedWatchPage,
});

type FedEntry = { date: string; cut: number; hold: number; hike: number };

function FedWatchPage() {
  const { entries, upsert, remove } = useLedger<FedEntry>("ledger:fedwatch");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: todayISO(), cut: "", hold: "", hike: "" });
  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const cut = Number(form.cut), hold = Number(form.hold), hike = Number(form.hike || 0);
    if ([cut, hold, hike].some((n) => isNaN(n) || n < 0 || n > 100)) { toast.error("Probabilities must be 0–100"); return; }
    upsert({ date: form.date, cut, hold, hike });
    toast.success("Entry logged");
    setOpen(false);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">FedWatch Tracker</h1>
          <p className="text-sm text-muted-foreground">Manual daily ledger of next-meeting rate probabilities.</p>
        </div>
        <Button onClick={() => { setForm({ date: todayISO(), cut: "", hold: "", hike: "" }); setOpen(true); }}>
          <Plus /> Log today
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["cut", "hold", "hike"] as const).map((k) => {
          const d = latest && prev ? latest[k] - prev[k] : null;
          return (
            <div key={k} className="rounded-lg border border-border bg-card p-5">
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{k}</div>
              <div className="mt-2 font-mono text-3xl font-semibold">{latest ? `${latest[k].toFixed(1)}%` : "—"}</div>
              {d !== null && (
                <div className={`mt-1 font-mono text-sm ${d >= 0 ? "text-positive" : "text-negative"}`}>
                  {d >= 0 ? "+" : ""}{d.toFixed(1)} pts 1D
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Cut</th><th className="px-4 py-3 text-right">Hold</th><th className="px-4 py-3 text-right">Hike</th><th className="w-12" /></tr>
          </thead>
          <tbody className="font-mono">
            {entries.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center font-sans text-muted-foreground">No entries yet. Click “Log today” to start.</td></tr>}
            {[...entries].reverse().map((e) => (
              <tr key={e.date} className="border-t border-border">
                <td className="px-4 py-3">{e.date}</td>
                <td className="px-4 py-3 text-right">{e.cut.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{e.hold.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{e.hike.toFixed(1)}%</td>
                <td className="px-2"><Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(e.date)}><Trash2 /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log FedWatch probabilities</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Date</Label><Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              {(["cut", "hold", "hike"] as const).map((k) => (
                <div key={k} className="space-y-2"><Label className="capitalize">{k} %</Label>
                  <Input type="number" step="0.1" required={k !== "hike"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
              ))}
            </div>
            <DialogFooter><Button type="submit">Save entry</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
