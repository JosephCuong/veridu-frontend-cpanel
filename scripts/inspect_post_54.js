const https = require('https');

const options = {
  hostname: 'cljglzhuwdniynfkzkxc.supabase.co',
  path: '/rest/v1/posts?id=eq.54&select=id,title,title_en,slug,content,content_en',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const p = JSON.parse(data)[0];
      if (!p) {
        console.log('Post 54 not found');
        return;
      }
      console.log('Post ID:', p.id);
      console.log('Title VI:', p.title);
      console.log('Title EN:', p.title_en);
      console.log('VI Content Length:', p.content?.length || 0);
      console.log('EN Content Length:', p.content_en?.length || 0);

      const viImgs = (p.content || '').match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
      const enImgs = (p.content_en || '').match(/<img[^>]+src=["']([^"']+)["']/gi) || [];

      console.log('\n--- VI IMAGES (' + viImgs.length + ') ---');
      viImgs.forEach((img, i) => console.log(`[VI ${i + 1}]:`, img.substring(0, 100)));

      console.log('\n--- EN IMAGES (' + enImgs.length + ') ---');
      enImgs.forEach((img, i) => console.log(`[EN ${i + 1}]:`, img.substring(0, 100)));

      // Check if EN content has figures or veridu-image-block
      const viFigures = (p.content || '').match(/<figure[^>]*class=["'][^"']*veridu-image-block[^"']*["']/gi) || [];
      const enFigures = (p.content_en || '').match(/<figure[^>]*class=["'][^"']*veridu-image-block[^"']*["']/gi) || [];
      console.log('\nVI veridu-image-block count:', viFigures.length);
      console.log('EN veridu-image-block count:', enFigures.length);

    } catch (e) {
      console.error('Parse error:', e);
    }
  });
}).on('error', console.error);
