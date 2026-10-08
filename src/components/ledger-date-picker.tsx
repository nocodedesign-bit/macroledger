import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function LedgerDatePicker({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const parsed = value ? parseISO(value) : undefined;
  const date = parsed && isValid(parsed) ? parsed : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" aria-label={label} className={`h-12 w-full justify-start gap-3 bg-background px-3 text-left font-mono text-sm font-medium ${date ? "text-foreground" : "text-muted-foreground"}`}>
          <CalendarIcon className="size-4 shrink-0" />
          <span>{date ? format(date, "MMM d, yyyy") : "Select date"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="pointer-events-auto w-auto p-0" align="start">
        <Calendar mode="single" selected={date} defaultMonth={date ?? new Date()} captionLayout="dropdown" startMonth={new Date(2000, 0)} endMonth={new Date(2100, 11)} onSelect={(selected) => { if (selected) { onChange(format(selected, "yyyy-MM-dd")); setOpen(false); } }} autoFocus className="pointer-events-auto p-3" />
      </PopoverContent>
    </Popover>
  );
}