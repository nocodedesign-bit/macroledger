import { useCallback, useEffect, useState } from "react";

/** Persistent ledger stored in the browser, sorted by date ascending, one entry per date. */
export function useLedger<T extends { date: string }>(key: string) {
  const [entries, setEntries] = useState<T[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  const persist = useCallback(
    (next: T[]) => {
      const sorted = [...next].sort((a, b) => a.date.localeCompare(b.date));
      setEntries(sorted);
      localStorage.setItem(key, JSON.stringify(sorted));
    },
    [key],
  );

  const upsert = useCallback(
    (entry: T) => persist([...entries.filter((e) => e.date !== entry.date), entry]),
    [entries, persist],
  );
  const remove = useCallback(
    (date: string) => persist(entries.filter((e) => e.date !== date)),
    [entries, persist],
  );

  return { entries, ready, upsert, remove };
}

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
