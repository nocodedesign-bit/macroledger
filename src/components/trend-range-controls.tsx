import { useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { LedgerDatePicker } from "@/components/ledger-date-picker";

const PRESETS = [7, 30, 90] as const;

export function useTrendRange<T extends { date: string }>(entries: T[]) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const first = entries[0]?.date ?? "";
  const latest = entries[entries.length - 1]?.date ?? "";
  const defaultFrom = latest ? (first > format(subDays(parseISO(latest), 29), "yyyy-MM-dd") ? first : format(subDays(parseISO(latest), 29), "yyyy-MM-dd")) : "";
  const effFrom = from || defaultFrom;
  const effTo = to || latest;
  const ranged = entries.filter((entry) => (!effFrom || entry.date >= effFrom) && (!effTo || entry.date <= effTo));

  const applyDays = (days: number) => {
    if (!latest) return;
    setFrom(format(subDays(parseISO(latest), days - 1), "yyyy-MM-dd"));
    setTo(latest);
  };
  const clear = () => { setFrom(""); setTo(""); };
  const isCustom = from !== "" || to !== "";

  return { ranged, effFrom, effTo, setFrom, setTo, applyDays, clear, isCustom, latest };
}

export function TrendRangeControls({ range }: { range: ReturnType<typeof useTrendRange> }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-3 sm:flex sm:w-auto sm:items-end sm:gap-3">
      <div className="min-w-0">
        <span className="mb-1 block text-xs text-muted-foreground">From date</span>
        <LedgerDatePicker compact id="trend-from" label="From date" value={range.effFrom} onChange={range.setFrom} />
      </div>
      <div className="min-w-0">
        <span className="mb-1 block text-xs text-muted-foreground">To date</span>
        <LedgerDatePicker compact id="trend-to" label="To date" value={range.effTo} onChange={range.setTo} />
      </div>
      <div className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-1 sm:pb-0.5">
        <span className="shrink-0 text-sm text-muted-foreground">Show</span>
        <div className="flex overflow-hidden rounded-md border border-border">
          {PRESETS.map((days) => {
            const active = range.latest !== "" && range.effTo === range.latest && range.effFrom === format(subDays(parseISO(range.latest), days - 1), "yyyy-MM-dd");
            return (
              <Button key={days} type="button" variant="ghost" size="sm" onClick={() => range.applyDays(days)}
                className={`h-9 rounded-none px-3 font-mono text-xs ${active ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                {days}D
              </Button>
            );
          })}
        </div>
        {range.isCustom && <Button type="button" variant="ghost" size="sm" className="h-9 px-3 text-xs text-muted-foreground" onClick={range.clear}>All</Button>}
      </div>
    </div>
  );
}
