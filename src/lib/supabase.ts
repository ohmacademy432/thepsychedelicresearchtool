import { createClient } from "@supabase/supabase-js";

// The anon/public key is safe to expose in the browser bundle — Supabase is
// designed this way. Actual data protection comes from Row-Level Security
// policies in the database, not from secrecy of the anon key.
// The Anthropic API key, by contrast, is NOT here — it's server-only in the
// Netlify function.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw — we want the app to load and show a clear error screen
  // rather than a blank page. The AuthProvider will detect missing config.
  console.warn(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.",
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://missing.supabase.co",
  supabaseAnonKey ?? "missing-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export interface Profile {
  id: string;
  full_name: string;
  professional_role: string;
  credentials: string | null;
  organization: string | null;
  access_request_note: string | null;
  approved: boolean;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}
