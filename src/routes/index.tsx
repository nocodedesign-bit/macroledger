import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { todayISO, useLedger } from "@/hooks/use-ledger";
import { FedWatchChart, type FedEntry } from "@/components/fedwatch-chart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FedWatch Tracker — Macro Ledger" },
      { name: "description", content: "Log daily FedWatch rate probabilities for the next FOMC meeting." },
      { property: "og:title", content: "FedWatch Tracker — Macro Ledger" },
      { property: "og:description", content: "Log daily FedWatch rate probabilities for the next FOMC meeting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FedWatchPage,
});

function FedWatchPage() {
  const { entries, upsert, remove } = useLedger<FedEntry>("ledger:fedwatch");
  const { entries: dollarCloses } = useLedger<{ date: string; dxy: number; exy: number }>("ledger:dxy-exy");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: todayISO(), cut: "", hold: "", hike: "", dxy: "", us02y: "" });
  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const cut = Number(form.cut), hold = Number(form.hold), hike = Number(form.hike || 0);
    if ([cut, hold, hike].some((n) => isNaN(n) || n < 0 || n > 100)) { toast.error("Probabilities must be 0–100"); return; }
    const dxy = form.dxy.trim() === "" ? undefined : Number(form.dxy);
    const us02y = form.us02y.trim() === "" ? undefined : Number(form.us02y);
    if ((dxy !== undefined && (!Number.isFinite(dxy) || dxy <= 0)) || (us02y !== undefined && (!Number.isFinite(us02y) || us02y < 0))) { toast.error("Enter a positive DXY close and a non-negative US02Y yield"); return; }
    upsert({ date: form.date, cut, hold, hike, dxy, us02y });
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
        <Button onClick={() => { setForm({ date: todayISO(), cut: "", hold: "", hike: "", dxy: "", us02y: "" }); setOpen(true); }}>
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

      <FedWatchChart entries={entries} dollarCloses={dollarCloses} />

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Cut</th><th className="px-4 py-3 text-right">Hold</th><th className="px-4 py-3 text-right">Hike</th><th className="px-4 py-3 text-right">DXY</th><th className="px-4 py-3 text-right">US02Y</th><th className="w-24" /></tr>
          </thead>
          <tbody className="font-mono">
            {entries.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center font-sans text-muted-foreground">No entries yet.</td></tr>}
            {[...entries].reverse().map((e) => (
              <tr key={e.date} className="border-t border-border">
                <td className="px-4 py-3">{e.date}</td>
                <td className="px-4 py-3 text-right">{e.cut.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{e.hold.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{e.hike.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{(e.dxy ?? dollarCloses.find((close) => close.date === e.date)?.dxy)?.toFixed(3) ?? "—"}</td>
                <td className="px-4 py-3 text-right">{e.us02y === undefined ? "—" : `${e.us02y.toFixed(2)}%`}</td>
                <td className="whitespace-nowrap px-2"><Button variant="ghost" size="icon" aria-label={`Edit ${e.date}`} onClick={() => { setForm({ date: e.date, cut: String(e.cut), hold: String(e.hold), hike: String(e.hike), dxy: e.dxy === undefined ? "" : String(e.dxy), us02y: e.us02y === undefined ? "" : String(e.us02y) }); setOpen(true); }}><Pencil /></Button><Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(e.date)}><Trash2 /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log FedWatch probabilities</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="fed-date">Date</Label><Input id="fed-date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              {(["cut", "hold", "hike"] as const).map((k) => (
                <div key={k} className="space-y-2"><Label htmlFor={`fed-${k}`} className="capitalize">{k} %</Label>
                  <Input id={`fed-${k}`} type="number" step="0.1" required={k !== "hike"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="fed-dxy">DXY close (optional)</Label><Input id="fed-dxy" type="number" min="0" step="any" value={form.dxy} onChange={(e) => setForm({ ...form, dxy: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="fed-us02y">US02Y yield % (optional)</Label><Input id="fed-us02y" type="number" min="0" step="any" value={form.us02y} onChange={(e) => setForm({ ...form, us02y: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit">Save entry</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
