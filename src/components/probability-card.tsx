import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { ProbabilityKind } from "@/lib/probability-scenarios";

const icons = { cut: ArrowDownRight, hold: ArrowRight, hike: ArrowUpRight };
const bars = { cut: "bg-transparent", hold: "bg-gradient-to-r from-dominant to-probability-teal", hike: "bg-negative/80" };
const descriptions = { cut: "Rate decrease", hold: "Unchanged rate", hike: "Rate increase" };

export function ProbabilityCard({ kind, value, change, dominant }: { kind: ProbabilityKind; value: number | undefined; change: number | null; dominant: boolean }) {
  const Icon = icons[kind];
  return (
    <div data-probability={kind} data-dominant={dominant} className={`@container relative min-w-0 rounded-2xl border bg-probability-card/70 p-6 backdrop-blur-md transition-all duration-300 motion-safe:hover:-translate-y-1 motion-reduce:transition-none ${dominant ? "border-dominant/40 shadow-lg shadow-dominant/10 hover:border-dominant/70" : "border-border hover:border-muted-foreground/40"}`}>
      {dominant && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-dominant/40 bg-probability-card px-3 py-1 text-[10px] font-bold uppercase text-dominant">Dominant outcome</span>}
      <div className="grid grid-cols-1 items-start gap-2 @[280px]:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${dominant ? "border border-dominant/20 bg-dominant/10 text-dominant" : "bg-secondary/60 text-muted-foreground"}`}><Icon className="size-4" /></span>
          <div className="min-w-0"><div className={`text-sm font-bold uppercase ${dominant ? "text-dominant" : "text-muted-foreground"}`}>{kind}</div><div className="mt-0.5 text-xs text-muted-foreground">{descriptions[kind]}</div></div>
        </div>
        {change !== null && <span className={`shrink-0 justify-self-start whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums @[280px]:justify-self-end ${change > 0 ? "border-positive/20 bg-positive/10 text-positive" : change < 0 ? "border-negative/20 bg-negative/10 text-negative" : "border-border bg-secondary/60 text-muted-foreground"}`}>{change >= 0 ? "+" : ""}{change.toFixed(1)} pts 1D</span>}
      </div>
      <div className="mt-5 text-4xl font-extrabold tabular-nums text-foreground">{value === undefined ? "—" : `${value.toFixed(1)}%`}</div>
      <div role="progressbar" aria-label={`${kind} probability`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className="mt-5 h-2 overflow-hidden rounded-full border border-border bg-secondary/60">
        <div className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${bars[kind]}`} style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }} />
      </div>
    </div>
  );
}
