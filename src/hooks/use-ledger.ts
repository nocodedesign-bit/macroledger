import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAccount } from "@/hooks/use-account";
import { toast } from "sonner";

/** Private online ledger, sorted by date, with one entry per user/date. */
export function useLedger<T extends { date: string }>(key: string) {
  const { user, ready } = useAccount();
  const queryClient = useQueryClient();
  const queryKey = ["ledger", user?.id, key];
  const query = useQuery({ queryKey, enabled: !!user, queryFn: async () => {
    if (!user) return [];
    const rows: T[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.from("ledger_entries").select("data,record_date").eq("user_id", user.id).eq("ledger_key", key).order("record_date").range(offset, offset + 999);
      if (error) throw error;
      rows.push(...data.map((row) => ({ ...(row.data as object), date: row.record_date }) as T));
      if (data.length < 1000) break;
    }
    return rows;
  } });
  const upsert = async (entry: T) => {
    if (!user) throw new Error("Sign in to save your entries");
    const { error } = await supabase.from("ledger_entries").upsert({ user_id: user.id, ledger_key: key, record_date: entry.date, data: JSON.parse(JSON.stringify(entry)) as Json });
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey });
  };
  const remove = async (date: string) => {
    if (!user) return;
    const { error } = await supabase.from("ledger_entries").delete().eq("user_id", user.id).eq("ledger_key", key).eq("record_date", date);
    if (error) { toast.error("Could not delete entry. Please retry."); return; }
    await queryClient.invalidateQueries({ queryKey });
  };
  return { entries: user ? query.data ?? [] : [], ready: ready && (!user || !query.isPending), upsert, remove, error: query.error };
}

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
