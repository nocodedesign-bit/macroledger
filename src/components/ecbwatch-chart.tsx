import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type EcbEntry = { date: string; ecbMeeting?: string | undefined; cut: number; hold: number; hike: number; exy?: number | undefined; de02y?: number | undefined };

export function EcbWatchChart({ entries, dollarCloses }: { entries: EcbEntry[]; dollarCloses: { date: string; exy: number }[] }) {
  const [overlay, setOverlay] = useState("exy");
  const showDxy = overlay === "exy" || overlay === "both";
  const showYield = overlay === "de02y" || overlay === "both";
  const data = entries.map((entry) => ({ ...entry, exy: entry.exy ?? dollarCloses.find((close) => close.date === entry.date)?.exy ?? null, de02y: entry.de02y ?? null }));
  const hasOverlay = data.some((entry) => (showDxy && entry.exy !== null) || (showYield && entry.de02y !== null));

  return (
    <section aria-label="Probability trend" className="border-y border-border py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Probability trend</h2>
        <Select value={overlay} onValueChange={setOverlay}>
          <SelectTrigger aria-label="Chart overlay" className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No overlay</SelectItem>
            <SelectItem value="exy">Overlay EXY</SelectItem>
            <SelectItem value="de02y">Overlay DE02Y (Schatz)</SelectItem>
            <SelectItem value="both">Overlay EXY + DE02Y (Schatz)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-80 min-w-0 sm:h-96">
        {data.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No daily entries yet</div> : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 4, bottom: 12, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(date: string) => date.slice(5)} minTickGap={24} />
              <YAxis yAxisId="probability" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(value: number) => `${value}%`} stroke="var(--muted-foreground)" fontSize={11} width={45} />
              {showDxy && <YAxis yAxisId="exy" orientation="right" domain={["auto", "auto"]} tickFormatter={(value: number) => value.toFixed(3)} stroke="var(--foreground)" fontSize={10} width={58} />}
              {showYield && <YAxis yAxisId="de02y" orientation="right" domain={["auto", "auto"]} tickFormatter={(value: number) => `${value.toFixed(2)}%`} stroke="var(--exy)" fontSize={10} width={52} />}
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div className="rounded-md border border-border bg-popover p-3 font-mono text-xs shadow-sm">
                  <div className="mb-2 text-popover-foreground">{label}</div>
                  {payload.map((item) => <div key={String(item.dataKey)} className={item.dataKey === "hold" ? "text-primary" : item.dataKey === "cut" ? "text-positive" : item.dataKey === "hike" ? "text-negative" : item.dataKey === "de02y" ? "text-exy" : "text-foreground"}>{item.name}: {Number(item.value).toFixed(item.dataKey === "exy" ? 3 : item.dataKey === "de02y" ? 2 : 1)}{item.dataKey === "exy" ? "" : "%"}</div>)}
                </div>
              ) : null} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="probability" type="linear" dataKey="hold" name="No Change" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              <Line yAxisId="probability" type="linear" dataKey="cut" name="Cut" stroke="var(--positive)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              <Line yAxisId="probability" type="linear" dataKey="hike" name="Hike" stroke="var(--negative)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              {showDxy && <Line yAxisId="exy" type="linear" dataKey="exy" name="EXY" stroke="var(--foreground)" strokeDasharray="6 4" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />}
              {showYield && <Line yAxisId="de02y" type="linear" dataKey="de02y" name="DE02Y (Schatz)" stroke="var(--exy)" strokeDasharray="3 3" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      {data.length > 0 && overlay !== "none" && !hasOverlay && <p className="mt-3 text-sm text-muted-foreground">No {overlay === "both" ? "EXY or DE02Y (Schatz)" : overlay.toUpperCase()} closes logged for these dates.</p>}
    </section>
  );
}