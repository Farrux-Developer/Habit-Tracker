import { createClient, SupabaseClient } from "@supabase/supabase-js";

// We use a Proxy to defer Supabase client initialization.
// This allows the build to succeed on Vercel even without Supabase environment variables,
// which is necessary so that the Vercel URL redirect (to the GitHub Releases app download page)
// can be successfully deployed and active.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    if (!supabaseInstance) {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("supabaseUrl and supabaseAnonKey are required.");
      }
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: { eventsPerSecond: 10 },
        },
      });
    }
    return (supabaseInstance as any)[prop];
  },
});
