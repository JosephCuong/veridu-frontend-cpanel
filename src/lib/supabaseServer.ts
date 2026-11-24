import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './supabaseClient';

let cachedServiceClient: SupabaseClient | null = null;
let cachedServiceKey: string | null = null;

export const getSupabaseServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && typeof serviceKey === 'string' && serviceKey.trim().length > 20) {
    const trimmed = serviceKey.trim();
    if (cachedServiceClient && cachedServiceKey === trimmed) {
      return cachedServiceClient;
    }
    cachedServiceKey = trimmed;
    cachedServiceClient = createClient(supabaseUrl, trimmed, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return cachedServiceClient;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
