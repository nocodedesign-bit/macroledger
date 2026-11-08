import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function LedgerDatePicker({ id, label, value, onChange, compact = false }: { id: string; label: string; value: string; onChange: (value: string) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const parsed = value ? parseISO(value) : undefined;
  const date = parsed && isValid(parsed) ? parsed : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" aria-label={label} className={`w-full min-w-0 justify-start bg-background text-left font-mono font-medium ${compact ? "h-10 gap-2 px-2.5 text-xs sm:h-12 sm:gap-3 sm:px-3 sm:text-sm" : "h-12 gap-3 px-3 text-sm"} ${date ? "text-foreground" : "text-muted-foreground"}`}>
          <CalendarIcon className="size-4 shrink-0" />
          {date && compact ? <><span className="min-w-0 truncate sm:hidden">{format(date, "MMM d, yy")}</span><span className="hidden sm:inline">{format(date, "MMM d, yyyy")}</span></> : <span className="min-w-0 truncate">{date ? format(date, "MMM d, yyyy") : "Select date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="pointer-events-auto w-auto p-0" align="start">
        <Calendar mode="single" selected={date} defaultMonth={date ?? new Date()} captionLayout="dropdown" startMonth={new Date(2000, 0)} endMonth={new Date(2100, 11)} onSelect={(selected) => { if (selected) { onChange(format(selected, "yyyy-MM-dd")); setOpen(false); } }} autoFocus className="pointer-events-auto p-3" />
      </PopoverContent>
    </Popover>
  );
}