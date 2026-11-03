import { useState } from "react";
import { subDays, format } from "date-fns";
import { Send, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LedgerDatePicker } from "@/components/ledger-date-picker";
import { explainLedger, insightLedgers } from "@/lib/ledger-insights.functions";

type Key = keyof typeof insightLedgers;

export function LedgerInsights({ defaultKey }: { defaultKey: string }) {
  const run = useServerFn(explainLedger);
  const [key, setKey] = useState<Key>((defaultKey in insightLedgers ? defaultKey : "ledger:fedwatch") as Key);
  const [from, setFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const cfg = insightLedgers[key];
  const presets = [
    `Rate impact on gold and ${cfg.indexName}`,
    `Recession risk and the ${cfg.yieldName} yield`,
    `Market pricing vs ${cfg.bank} guidance`,
  ];

  const go = async (q = question) => {
    if (from > to) { setError("Start date must be before the end date."); return; }
    setBusy(true); setError(null); setText(null);
    try {
      const r = await run({ data: { ledgerKey: key, from, to, question: q.trim() || undefined } });
      if (!r.text) setError(`Need at least 2 logged days in this range (found ${r.count}).`); else setText(r.text);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  };

  return (
    <section className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-md">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"><Sparkles className="size-4" />Macro intelligence</div>
      <div className="mb-4 text-lg font-semibold">AI analysis of rates and monetary policy</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <div className="space-y-2"><Label className="text-xs uppercase tracking-widest text-muted-foreground">Ledger</Label>
          <Select value={key} onValueChange={(v) => setKey(v as Key)}>
            <SelectTrigger className="h-12 bg-background"><SelectValue /></SelectTrigger>
            <SelectContent className="ledger-app">{(Object.keys(insightLedgers) as Key[]).map((k) => <SelectItem key={k} value={k}>{insightLedgers[k].bank} Watch vs {insightLedgers[k].indexName}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="space-y-2"><Label className="text-xs uppercase tracking-widest text-muted-foreground">From</Label><LedgerDatePicker id="ai-from" label="From" value={from} onChange={setFrom} /></div>
        <div className="space-y-2"><Label className="text-xs uppercase tracking-widest text-muted-foreground">To</Label><LedgerDatePicker id="ai-to" label="To" value={to} onChange={setTo} /></div>
        <Button className="h-12" disabled={busy} onClick={() => go("")}>{busy ? "Analyzing…" : "Full report"}</Button>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">Ready-made questions:</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {presets.map((p) => <Button key={p} variant="outline" size="sm" disabled={busy} onClick={() => { setQuestion(p); void go(p); }}>{p}</Button>)}
      </div>
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (question.trim()) void go(); }}>
        <Input aria-label="Ask a question" maxLength={500} placeholder="Ask about your ledger (e.g. is a 50bp cut being priced?)" value={question} onChange={(e) => setQuestion(e.target.value)} className="h-11 bg-background" />
        <Button type="submit" className="h-11" disabled={busy || !question.trim()}><Send /> Ask</Button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-negative">{error}</p>}
      {text && <div className="mt-5 whitespace-pre-wrap rounded-xl border border-border bg-background/60 p-4 text-sm leading-relaxed">{text}</div>}
      <p className="mt-3 text-xs text-muted-foreground">AI-generated from your own logged entries. Not financial advice.</p>
    </section>
  );
}
