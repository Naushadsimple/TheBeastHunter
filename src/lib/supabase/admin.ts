import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://riyaseiklavfzxjldzrg.supabase.co';
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey || serviceKey.startsWith('placeholder_') || serviceKey.includes('your_')) {
    serviceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  if (!serviceKey) {
    throw new Error('Missing Supabase API Key environment variable.');
  }

  return createClient(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
