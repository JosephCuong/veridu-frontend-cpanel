const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('library_articles')
    .select('interactiveHtml, contentHtml')
    .eq('slug', 'hanh-trinh-cua-mose-va-dan-israel')
    .single();
    
  if (error) console.error(error);
  else {
    const html = data.interactiveHtml || data.contentHtml || '';
    console.log(html.substring(0, 1500));
  }
}
run();
