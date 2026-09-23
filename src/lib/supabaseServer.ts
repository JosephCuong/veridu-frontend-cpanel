import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './supabaseClient';

export const getSupabaseServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && typeof serviceKey === 'string' && serviceKey.trim().length > 20) {
    return createClient(supabaseUrl, serviceKey.trim(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};
