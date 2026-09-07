import { createClient } from '@supabase/supabase-js';

const CANONICAL_SUPABASE_URL = 'https://cljglzhuwdniynfkzkxc.supabase.co';
const CANONICAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI';

export const getValidUrl = (url: string | undefined): string => {
  if (!url || typeof url !== 'string') return CANONICAL_SUPABASE_URL;
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  const lower = cleaned.toLowerCase();
  if (
    lower.includes('next_public') ||
    lower.includes('placeholder') ||
    lower.includes('your_') ||
    lower.includes('dummy') ||
    lower === 'undefined' ||
    lower === 'null'
  ) {
    return CANONICAL_SUPABASE_URL;
  }
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  try {
    const parsed = new URL(cleaned);
    if (!parsed.hostname || !parsed.hostname.includes('.') || parsed.hostname === 'next_public_supabase_url') {
      return CANONICAL_SUPABASE_URL;
    }
    return cleaned;
  } catch {
    return CANONICAL_SUPABASE_URL;
  }
};

export const getValidAnonKey = (key: string | undefined): string => {
  if (!key || typeof key !== 'string') return CANONICAL_SUPABASE_ANON_KEY;
  const cleaned = key.trim().replace(/^["']|["']$/g, '');
  const lower = cleaned.toLowerCase();
  if (
    lower.includes('next_public') ||
    lower.includes('placeholder') ||
    lower.includes('your_') ||
    lower.includes('dummy') ||
    lower === 'undefined' ||
    lower === 'null' ||
    cleaned.length < 30
  ) {
    return CANONICAL_SUPABASE_ANON_KEY;
  }
  // Check if it is a modern publishable key or a standard 3-part JWT
  if (cleaned.startsWith('sb_publishable_')) return cleaned;
  const parts = cleaned.split('.');
  if (parts.length === 3 && parts[0].length > 5 && parts[1].length > 5) return cleaned;
  return CANONICAL_SUPABASE_ANON_KEY;
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

