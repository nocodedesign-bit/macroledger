import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { todayISO, useLedger } from "@/hooks/use-ledger";
import { useAccount } from "@/hooks/use-account";
import { LedgerSummaryCard } from "@/components/ledger-summary-card";

export const Route = createFileRoute("/_app/dxy-vs-exy")({
  head: () => ({
    meta: [
      { title: "DXY vs EXY — Macro Ledger" },
      { name: "description", content: "Manual daily close ledger comparing the US Dollar Index with the Euro Index." },
      { property: "og:title", content: "DXY vs EXY — Macro Ledger" },
      { property: "og:description", content: "Manual daily close ledger comparing the US Dollar Index with the Euro Index." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DxyExyPage,
});

type Entry = { date: string; dxy: number; exy: number };

function correlation(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (xs[i]! - mx) * (ys[i]! - my); dx += (xs[i]! - mx) ** 2; dy += (ys[i]! - my) ** 2; }
  return dx && dy ? num / Math.sqrt(dx * dy) : null;
}

function DxyExyPage() {
  const { entries, upsert, remove, error } = useLedger<Entry>("ledger:dxy-exy");
  const { user } = useAccount();
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: todayISO(), dxy: "", exy: "" });
  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];

  // daily % returns for correlation
  const rets = entries.slice(1).map((e, i) => ({ d: e.dxy / entries[i]!.dxy - 1, e: e.exy / entries[i]!.exy - 1 }));
  const corr = correlation(rets.map((r) => r.d), rets.map((r) => r.e));

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const dxy = Number(form.dxy), exy = Number(form.exy);
    if (!(dxy > 0) || !(exy > 0)) { toast.error("Enter valid positive closes"); return; }
    setSaving(true);
    try { await upsert({ date: form.date, dxy, exy }); toast.success("Daily close logged"); setOpen(false); }
    catch { toast.error("Could not save close. Please retry."); }
    finally { setSaving(false); }
  };

  const card = (key: "dxy" | "exy", name: string, sub: string) => {
    const pct = latest && prev ? (latest[key] / prev[key] - 1) * 100 : null;
    return (
      <LedgerSummaryCard
        label={<span className="flex min-w-0 items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${key === "dxy" ? "bg-dxy" : "bg-exy"}`} />{name}<span className="truncate text-xs normal-case">{sub}</span></span>}
        value={latest ? latest[key].toFixed(3) : "—"}
        change={pct === null ? undefined : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}% 1D`}
        detail={latest?.date}
      />
    );
  };

  return (
    <main className="ledger-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid grid-cols-1 items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">DXY vs EXY</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Manual daily close ledger — US Dollar Index against the Euro Index.</p>
        </div>
        <Button className="ledger-log h-12 w-full text-base font-semibold sm:w-auto sm:px-7 [&_svg]:size-5" disabled={!user} onClick={() => { setForm({ date: todayISO(), dxy: "", exy: "" }); setOpen(true); }}>
          <Plus /> Log today
        </Button>
      </div>

      {!user && <p className="text-sm text-muted-foreground">Sign in to view and save your private ledger.</p>}
      {error && <p role="alert" className="text-sm text-negative">Could not load your closes. Please refresh to retry.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {card("dxy", "DXY", "US Dollar Index")}
        {card("exy", "EXY", "Euro Index")}
        <LedgerSummaryCard label="Correlation (daily returns)" value={corr === null ? "—" : corr.toFixed(2)} detail={corr === null ? "Needs 4+ entries" : corr < -0.5 ? "Strong inverse relationship" : corr < 0 ? "Weak inverse relationship" : "Not inverse in this sample"} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 text-sm font-medium">Daily closes</div>
        {entries.length < 2 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">Log at least two days to see the chart.</div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={entries} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis yAxisId="dxy" domain={["auto", "auto"]} stroke="var(--dxy)" fontSize={11} />
                <YAxis yAxisId="exy" orientation="right" domain={["auto", "auto"]} stroke="var(--exy)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Line yAxisId="dxy" type="monotone" dataKey="dxy" name="DXY" stroke="var(--dxy)" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="exy" type="monotone" dataKey="exy" name="EXY" stroke="var(--exy)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">DXY close</th><th className="px-4 py-3 text-right">1D</th><th className="px-4 py-3 text-right">EXY close</th><th className="px-4 py-3 text-right">1D</th><th className="w-12" /></tr>
          </thead>
          <tbody className="font-mono">
            {entries.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center font-sans text-muted-foreground">No closes logged yet. Click “Log today” to start.</td></tr>}
            {entries.map((e, i) => {
              const p = entries[i - 1];
              const ch = (k: "dxy" | "exy") => {
                if (!p) return <span className="text-muted-foreground">—</span>;
                const v = (e[k] / p[k] - 1) * 100;
                return <span className={v >= 0 ? "text-positive" : "text-negative"}>{v >= 0 ? "+" : ""}{v.toFixed(2)}%</span>;
              };
              return { e, row: (
                <tr key={e.date} className="border-t border-border">
                  <td className="px-4 py-3">{e.date}</td>
                  <td className="px-4 py-3 text-right">{e.dxy.toFixed(3)}</td>
                  <td className="px-4 py-3 text-right">{ch("dxy")}</td>
                  <td className="px-4 py-3 text-right">{e.exy.toFixed(3)}</td>
                  <td className="px-4 py-3 text-right">{ch("exy")}</td>
                  <td className="px-2"><Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(e.date)}><Trash2 /></Button></td>
                </tr>
              ) };
            }).reverse().map((x) => x.row)}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log daily close</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="d">Date</Label><Input id="d" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="dxy">DXY daily close</Label><Input id="dxy" type="number" step="any" required placeholder="e.g. 103.250" value={form.dxy} onChange={(e) => setForm({ ...form, dxy: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="exy">EXY daily close</Label><Input id="exy" type="number" step="any" required placeholder="e.g. 108.400" value={form.exy} onChange={(e) => setForm({ ...form, exy: e.target.value })} /></div>
            </div>
            {entries.some((x) => x.date === form.date) && <p className="text-xs text-muted-foreground">An entry for this date exists and will be replaced.</p>}
            <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save close"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
