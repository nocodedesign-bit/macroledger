import type { ReactNode } from "react";

export function LedgerSummaryCard({ label, value, change, detail, subtitle, icon, tone = "neutral" }: { label: ReactNode; value: string; change?: string | undefined; detail?: string | undefined; subtitle?: string; icon?: ReactNode; tone?: "dxy" | "index" | "neutral" }) {
  const positive = change?.startsWith("+");
  return (
    <div data-currency-summary className="@container min-w-0 rounded-2xl border border-border bg-probability-card/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-muted-foreground/40 motion-safe:hover:-translate-y-1 motion-reduce:transition-none">
      <div className="grid grid-cols-1 items-start gap-2 @[280px]:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone === "dxy" ? "bg-dxy/10 text-dxy" : tone === "index" ? "bg-exy/10 text-exy" : "bg-dominant/10 text-dominant"}`}>{icon}</span>}
          <div className="min-w-0"><div className="text-sm font-bold uppercase text-muted-foreground">{label}</div>{subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}</div>
        </div>
        {change && <span className={`shrink-0 justify-self-start whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums @[280px]:justify-self-end ${positive ? "border-positive/20 bg-positive/10 text-positive" : "border-negative/20 bg-negative/10 text-negative"}`}>{change}</span>}
      </div>
      <div className="mt-5 min-w-0 break-words text-4xl font-extrabold tabular-nums text-foreground">{value}</div>
      <div className={`mt-5 border-t pt-3 ${tone === "dxy" ? "border-dxy/20" : tone === "index" ? "border-exy/20" : "border-dominant/20"}`}>
        <p className="min-h-4 text-xs text-muted-foreground">{detail ?? "—"}</p>
      </div>
    </div>
  );
}