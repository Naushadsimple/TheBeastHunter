import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isPlaceholder = !serviceKey || 
    serviceKey.startsWith('placeholder_') || 
    serviceKey.includes('your_');

  const keyToUse = isPlaceholder ? anonKey : serviceKey;

  if (!keyToUse) {
    throw new Error('Missing SUPABASE API key environment variable.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    keyToUse,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
