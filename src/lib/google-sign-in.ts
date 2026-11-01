import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

// Lovable's managed Google flow relies on /~oauth paths served only by Lovable hosting.
// On other hosts (e.g. Vercel) fall back to the standard redirect flow.
function isLovableHost(hostname: string) {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".lovable.app") || h.endsWith(".lovableproject.com") || h.endsWith(".lovableproject-dev.com");
}

export async function signInWithGoogle(): Promise<{ redirected: boolean }> {
  if (isLovableHost(window.location.hostname)) {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) throw result.error;
    return { redirected: !!result.redirected };
  }
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  if (error) throw error;
  return { redirected: true };
}
