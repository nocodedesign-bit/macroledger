import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LedgerDatePicker } from "@/components/ledger-date-picker";

export function EntryDateControls({ value, onChange, updated }: { value: string; onChange: (v: string) => void; updated: string | undefined }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex min-w-0 items-center gap-2 md:w-72">
        <div className="min-w-0 flex-1"><LedgerDatePicker id="entry-date" label="Entry date" value={value} onChange={onChange} /></div>
        {value && <Button variant="ghost" size="icon" className="size-11 shrink-0" aria-label="Show latest entry" onClick={() => onChange("")}><X /></Button>}
      </div>
      <span className="w-fit rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground">
        Updated: {updated ? format(parseISO(updated), "MMM d, yyyy") : "—"}
      </span>
    </div>
  );
}
