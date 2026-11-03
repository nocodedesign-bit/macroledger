import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, Scale, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { taylorRate } from "@/lib/taylor-rule";

export const Route = createFileRoute("/_app/policy-simulator")({
  head: () => ({ meta: [
    { title: "Policy Simulator — Macro Ledger" },
    { name: "description", content: "Taylor rule simulator: compare a theoretical policy rate with the current rate." },
    { property: "og:title", content: "Policy Simulator — Macro Ledger" },
    { property: "og:description", content: "Taylor rule simulator: compare a theoretical policy rate with the current rate." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PolicySimulator,
});

function Field({ label, value, min, max, step, onChange, hints }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hints: [string, string, string] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm"><span className="font-medium">{label}</span><span className="font-mono font-semibold text-primary">{value.toFixed(1)}%</span></div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v ?? value)} aria-label={label} />
      <div className="flex justify-between font-mono text-[11px] text-muted-foreground">{hints.map((h) => <span key={h}>{h}</span>)}</div>
    </div>
  );
}

function PolicySimulator() {
  const [inflation, setInflation] = useState(2);
  const [unemployment, setUnemployment] = useState(4.2);
  const [neutral, setNeutral] = useState(2);
  const [current, setCurrent] = useState("");
  const rate = taylorRate({ inflation, unemployment, neutral });
  const cur = current.trim() === "" ? undefined : Number(current);
  const gap = cur !== undefined && Number.isFinite(cur) ? cur - rate : undefined;

  return (
    <main className="ledger-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Fed Decision & Taylor Rule Simulator</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">Choose inflation and unemployment scenarios to see the theoretical policy rate and compare it with the current rate.</p>
      </div>
      <section className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"><Scale className="size-4" />Taylor rule simulator</div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The Taylor rule is a standard benchmark for judging whether the policy rate is restrictive or stimulative, based on the inflation gap and the unemployment gap.</p>
      </section>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <section className="space-y-7 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="size-4 text-primary" />Scenario inputs</div>
          <Field label="Annual inflation (PCE / CPI)" value={inflation} min={0} max={8} step={0.1} onChange={setInflation} hints={["0% deflation", "2% target", "8% high"]} />
          <Field label="Unemployment rate" value={unemployment} min={2} max={10} step={0.1} onChange={setUnemployment} hints={["2% tight", "4.2% NAIRU", "10% recession"]} />
          <Field label="Neutral real rate (r*)" value={neutral} min={0} max={4} step={0.1} onChange={setNeutral} hints={["0%", "2% classic", "4%"]} />
        </section>
        <section className="space-y-5 rounded-2xl border border-border bg-card/70 p-5 text-center backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Gauge className="size-4 text-primary" />Taylor rule suggested rate</div>
          <div className="font-mono text-5xl font-bold text-positive">{rate.toFixed(2)}%</div>
          <div className="space-y-2 text-left">
            <Label htmlFor="cur-rate" className="text-xs uppercase tracking-widest text-muted-foreground">Your current policy rate % (enter manually)</Label>
            <Input id="cur-rate" type="number" step="0.01" value={current} onChange={(e) => setCurrent(e.target.value)} className="h-11 bg-background font-mono" />
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-4 text-left text-sm">
            <div className="flex justify-between"><span>Policy gap (current − Taylor)</span><span className={`font-mono font-semibold ${gap === undefined ? "text-muted-foreground" : gap > 0 ? "text-primary" : "text-negative"}`}>{gap === undefined ? "—" : `${gap > 0 ? "+" : ""}${gap.toFixed(2)}%`}</span></div>
            <p className="mt-2 text-xs text-muted-foreground">{gap === undefined ? "Enter the current rate to compare." : gap > 0.25 ? "Policy looks restrictive versus the rule." : gap < -0.25 ? "Policy looks stimulative versus the rule." : "Policy is roughly in line with the rule."}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
