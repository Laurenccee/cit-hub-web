import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

// Module-level singleton — avoids creating a new client instance on every
// component render. `createBrowserClient` has internal deduplication, but
// an explicit singleton makes the intent clear and avoids any overhead.
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
}
