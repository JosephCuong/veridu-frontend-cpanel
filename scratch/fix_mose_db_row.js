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
    .or('slug.ilike.%m-s%,slug.ilike.%israel%,slug.ilike.%mose%');
    
  if (error) {
    console.error('Error fetching post:', error);
  } else {
    console.log('FOUND POSTS COUNT:', posts?.length);
    for (const p of (posts || [])) {
      console.log(`- ID: ${p.id}, Title: "${p.title}", Slug: "${p.slug}", Current Type: "${p.article_type}"`);
      if (p.article_type !== 'interactive') {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ article_type: 'interactive', category: 'Bài Tương Tác HTML 3D' })
          .eq('id', p.id);
        if (updateError) {
          console.error(`Failed to update post ${p.id}:`, updateError);
        } else {
          console.log(`SUCCESSFULLY UPDATED post ${p.id} to interactive!`);
        }
      }
    }
  }
}
run();
