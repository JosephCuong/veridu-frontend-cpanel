import { createClient } from '@supabase/supabase-js';

const getValidUrl = (url: string | undefined): string => {
  if (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  return 'https://tamhjdyiwvhzzrtwmoai.supabase.co';
};

const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_placeholder_key_for_build';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
