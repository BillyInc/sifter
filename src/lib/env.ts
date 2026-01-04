// src/lib/env.ts
// Environment variable validation using Zod
import { z } from 'zod';

// Schema for client-side (public) environment variables
// Uses the new Supabase publishable key format (sb_publishable_...)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required')
    .optional(),
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL must be a valid URL')
    .optional()
    .default('https://api.sifter.com/v1'),
});

// Type for the validated environment
export type ClientEnv = z.infer<typeof clientEnvSchema>;

// Parse and validate client environment variables
function validateClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!parsed.success) {
    // In development, log a warning but don't throw
    // In production, you might want to throw
    console.warn(
      'Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    );

    // Return empty/default values for invalid config
    return {
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined,
      NEXT_PUBLIC_API_URL: 'https://api.sifter.com/v1',
    };
  }

  return parsed.data;
}

// Cached validated environment
let cachedEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (cachedEnv) return cachedEnv;
  cachedEnv = validateClientEnv();
  return cachedEnv;
}

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const env = getClientEnv();
  return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

// Get Supabase config (throws if not configured when strict=true)
export function getSupabaseConfig(strict: boolean = false): {
  url: string;
  publishableKey: string;
} | null {
  const env = getClientEnv();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    if (strict) {
      throw new Error(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env.local file.'
      );
    }
    return null;
  }

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
