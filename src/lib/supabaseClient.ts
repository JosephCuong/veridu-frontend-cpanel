import { createClient } from '@supabase/supabase-js';

const getValidUrl = (url: string | undefined): string => {
  if (url && typeof url === 'string' && url.startsWith('http')) {
    // N?u url k?t thc b?ng /rest/v1/ th? c?t b? ph?n ui
    return url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  }
  return 'https://cljglzhuwdniynfkzkxc.supabase.co';
};

const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'sb_publishable_placeholder_key_for_build')
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
