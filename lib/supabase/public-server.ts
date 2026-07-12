import { createClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Server-side Supabase client using the anon key for public reads protected by RLS.
 * Use for published content in Server Components — never for admin writes.
 */
export function createPublicSupabaseClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    // CMS content changes outside the Next build; refresh public reads on ISR.
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: 60 },
        }),
    },
  });
}
