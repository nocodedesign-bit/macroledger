import type { ReactNode } from "react";

export function LedgerSummaryCard({ label, value, change, detail }: { label: ReactNode; value: string; change?: string; detail?: string }) {
  const positive = change?.startsWith("+");
  return (
    <div className="ledger-summary min-w-0 border border-border bg-card">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
        <div className="ledger-value min-w-0 font-semibold tabular-nums">{value}</div>
        {change && <span className={`shrink-0 rounded border px-2.5 py-1.5 text-xs tabular-nums ${positive ? "border-positive/25 bg-positive/10 text-positive" : "border-negative/25 bg-negative/10 text-negative"}`}>{change}</span>}
      </div>
      {detail && <p className="mt-3 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}