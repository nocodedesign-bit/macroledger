import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

const icons = { cut: ArrowDownRight, hold: ArrowRight, hike: ArrowUpRight };
const bars = { cut: "bg-muted-foreground/60", hold: "bg-muted-foreground/60", hike: "bg-negative/70" };

export function ProbabilityCard({ kind, value, change, dominant }: { kind: "cut" | "hold" | "hike"; value: number | undefined; change: number | null; dominant: boolean }) {
  const Icon = icons[kind];
  return (
    <div className={`min-w-0 rounded-2xl border bg-card/70 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] ${dominant ? "border-dominant/50 shadow-lg shadow-dominant/10" : "border-border hover:border-muted-foreground/40"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider ${dominant ? "text-dominant" : "text-muted-foreground"}`}><Icon className="size-4 shrink-0" />{kind}</span>
        {change !== null && <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${change >= 0 ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}`}>{change >= 0 ? "+" : ""}{change.toFixed(1)} pts 1D</span>}
      </div>
      <div className="mt-4 text-3xl font-extrabold tabular-nums text-foreground md:text-4xl">{value === undefined ? "—" : `${value.toFixed(1)}%`}</div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-300 ${dominant ? "bg-gradient-to-r from-dominant/60 to-dominant" : bars[kind]}`} style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }} />
      </div>
    </div>
  );
}
