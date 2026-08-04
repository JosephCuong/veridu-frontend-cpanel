import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tamhjdyiwvhzzrtwmoai.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_F-c2d0f3hI_edCh0rI6vKg_8IZHvc3j';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
