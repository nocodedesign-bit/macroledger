import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AccountContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    let revision = 0;
    const initial = revision;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      revision += 1;
      setUser(session?.user ?? null);
      setReady(true);
      if (event === "SIGNED_OUT") { queryClient.clear(); void navigate({ to: "/", replace: true }); }
      else void queryClient.invalidateQueries();
      void router.invalidate();
    });
    void supabase.auth.getUser().then(({ data }) => { if (active && revision === initial) { setUser(data.user); setReady(true); } }).catch(() => { if (active) setReady(true); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [queryClient, router]);
  return <AccountContext.Provider value={{ user, ready }}>{children}</AccountContext.Provider>;
}

export const useAccount = () => useContext(AccountContext);