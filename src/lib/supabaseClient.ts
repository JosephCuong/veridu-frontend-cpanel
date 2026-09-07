import { createClient } from '@supabase/supabase-js';

export const getValidUrl = (url: string | undefined): string => {
  if (url && typeof url === 'string') {
    let cleaned = url.trim().replace(/^["']|["']$/g, '');
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }
    cleaned = cleaned.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      return 'https://cljglzhuwdniynfkzkxc.supabase.co';
    }
  }
  return 'https://cljglzhuwdniynfkzkxc.supabase.co';
};

export const getValidAnonKey = (key: string | undefined): string => {
  if (key && typeof key === 'string' && key !== 'sb_publishable_placeholder_key_for_build') {
    const cleaned = key.trim().replace(/^["']|["']$/g, '');
    if (cleaned.length > 20) return cleaned;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI';
};

export const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = getValidAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getAuthenticatedSupabaseClient = (token?: string | null) => {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return supabase;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token.trim()}` } }
    });
  } catch (e) {
    console.warn('Failed to create authenticated client, falling back to default:', e);
    return supabase;
  }
};

