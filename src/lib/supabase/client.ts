// src/lib/supabase/client.ts
// Browser client for client-side Supabase operations
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, isSupabaseConfigured as checkConfig } from '@/lib/env';

export { isSupabaseConfigured } from '@/lib/env';

export function createClient(): SupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config) {
    // Return null during build or when env vars are missing/invalid
    // The AuthContext will handle this gracefully
    return null;
  }

  return createBrowserClient(config.url, config.publishableKey);
}
