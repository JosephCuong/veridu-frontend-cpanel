const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cljglzhuwdniynfkzkxc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDAwMDAsImV4cCI6MjA1NTU1NTU1NX0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('library_articles')
    .select('slug, title, article_type, interactiveHtml, contentHtml')
    .eq('slug', 'hanh-trinh-cua-mose-va-dan-israel')
    .single();
    
  if (error) {
    console.error(error);
  } else {
    console.log('SLUG:', data.slug);
    console.log('ARTICLE TYPE:', data.article_type);
    console.log('HAS INTERACTIVE HTML:', !!data.interactiveHtml);
    console.log('CONTENT HTML LENGTH:', (data.contentHtml || '').length);
    console.log('INTERACTIVE HTML LENGTH:', (data.interactiveHtml || '').length);
    console.log('--- CONTENT SAMPLE ---');
    console.log((data.interactiveHtml || data.contentHtml || '').substring(0, 1500));
  }
}
run();
