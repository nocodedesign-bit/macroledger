import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendRangeControls, useTrendRange } from "@/components/trend-range-controls";

export type BankEntry = { date: string; meeting?: string | undefined; cut: number; hold: number; hike: number; indexClose?: number | undefined; bondYield?: number | undefined };

export function BankWatchChart({ entries, dollarCloses, indexName, yieldName }: { entries: BankEntry[]; dollarCloses: { date: string; indexClose: number }[]; indexName: string; yieldName: string }) {
  const [overlay, setOverlay] = useState("indexClose");
  const showDxy = overlay === "indexClose" || overlay === "both";
  const showYield = overlay === "bondYield" || overlay === "both";
  const range = useTrendRange(entries);
  const data = range.ranged.map((entry) => ({ ...entry, indexClose: entry.indexClose ?? dollarCloses.find((close) => close.date === entry.date)?.indexClose ?? null, bondYield: entry.bondYield ?? null }));
  const hasOverlay = data.some((entry) => (showDxy && entry.indexClose !== null) || (showYield && entry.bondYield !== null));

  return (
    <section aria-label="Probability trend" className="border-y border-border py-6">
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3">
        <h2 className="text-lg font-semibold">Probability trend</h2>
        <TrendRangeControls range={range} />
        <Select value={overlay} onValueChange={setOverlay}>
          <SelectTrigger aria-label="Chart overlay" className="w-full sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent className="ledger-app">
            <SelectItem value="none">No overlay</SelectItem>
            <SelectItem value="indexClose">Overlay {indexName}</SelectItem>
            <SelectItem value="bondYield">Overlay {yieldName}</SelectItem>
            <SelectItem value="both">Overlay {indexName} + {yieldName}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-80 min-w-0 sm:h-96">
        {data.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{entries.length ? "No entries in this date range" : "No daily entries yet"}</div> : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 4, bottom: 12, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(date: string) => date.slice(5)} minTickGap={24} />
              <YAxis yAxisId="probability" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(value: number) => `${value}%`} stroke="var(--muted-foreground)" fontSize={11} width={45} />
              {showDxy && <YAxis yAxisId="indexClose" orientation="right" domain={["auto", "auto"]} tickFormatter={(value: number) => value.toFixed(3)} stroke="var(--foreground)" fontSize={10} width={58} />}
              {showYield && <YAxis yAxisId="bondYield" orientation="right" domain={["auto", "auto"]} tickFormatter={(value: number) => `${value.toFixed(2)}%`} stroke="var(--exy)" fontSize={10} width={52} />}
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div className="rounded-md border border-border bg-popover p-3 font-mono text-xs shadow-sm">
                  <div className="mb-2 text-popover-foreground">{label}</div>
                  {payload.map((item) => <div key={String(item.dataKey)} className={item.dataKey === "hold" ? "text-primary" : item.dataKey === "cut" ? "text-positive" : item.dataKey === "hike" ? "text-negative" : item.dataKey === "bondYield" ? "text-exy" : "text-foreground"}>{item.name}: {Number(item.value).toFixed(item.dataKey === "indexClose" ? 3 : item.dataKey === "bondYield" ? 2 : 1)}{item.dataKey === "indexClose" ? "" : "%"}</div>)}
                </div>
              ) : null} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="probability" type="linear" dataKey="hold" name="No Change" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              <Line yAxisId="probability" type="linear" dataKey="cut" name="Cut" stroke="var(--positive)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              <Line yAxisId="probability" type="linear" dataKey="hike" name="Hike" stroke="var(--negative)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              {showDxy && <Line yAxisId="indexClose" type="linear" dataKey="indexClose" name={indexName} stroke="var(--foreground)" strokeDasharray="6 4" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />}
              {showYield && <Line yAxisId="bondYield" type="linear" dataKey="bondYield" name={yieldName} stroke="var(--exy)" strokeDasharray="3 3" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      {data.length > 0 && overlay !== "none" && !hasOverlay && <p className="mt-3 text-sm text-muted-foreground">No {overlay === "both" ? `${indexName} or ${yieldName}` : overlay === "indexClose" ? indexName : yieldName} closes logged for these dates.</p>}
    </section>
  );
}