const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.production', 'utf8');
let url = '';
let key = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function run() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, category, article_type, content')
    .or('slug.ilike.%mose%,slug.ilike.%israel%,slug.ilike.%m-s%')
    .limit(10);
    
  if (error) {
    console.error('Error fetching post:', error);
  } else {
    console.log('FOUND POSTS:', posts?.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      article_type: p.article_type,
      contentLength: (p.content || '').length,
      isInteractiveDoc: (p.content || '').includes('<html') || (p.content || '').includes('<!DOCTYPE') || (p.content || '').includes('<script')
    })));
  }
}
run();
