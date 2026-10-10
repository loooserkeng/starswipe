/**
 * Supabase client configuration & status diagnostic helper.
 * StarSwipe connects to Supabase PostgreSQL & Storage when credentials are provided,
 * while seamlessly operating on the local persistent database in development.
 */

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  supabaseUrl: string | null;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
  instructions: string[];
}

export function checkSupabaseStatus(): SupabaseConfigStatus {
  const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const anonKey = !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const isConfigured = !!(url && anonKey);

  return {
    isConfigured,
    supabaseUrl: url,
    hasAnonKey: anonKey,
    hasServiceKey: serviceKey,
    instructions: [
      '1. Create a project at https://supabase.com',
      '2. In the Supabase SQL Editor, run `supabase/schema.sql` followed by `supabase/rls_policies.sql`',
      '3. In Supabase Storage, run `supabase/storage_setup.sql` to provision `actress-portraits` & `pending-submissions` buckets',
      '4. Copy your Project URL & Anon Key into `.env` (or AI Studio secrets) as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
      '5. For administrative server-side operations, provide SUPABASE_SERVICE_ROLE_KEY in the server environment',
    ],
  };
}
