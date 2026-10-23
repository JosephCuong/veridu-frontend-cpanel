const https = require('https');

const options = {
  hostname: 'cljglzhuwdniynfkzkxc.supabase.co',
  path: '/rest/v1/posts?id=eq.53&select=id,title,title_en,content,content_en',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const p = JSON.parse(data)[0];
    const viImgs = (p.content || '').match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
    const enImgs = (p.content_en || '').match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
    console.log('Post 53:', p.title);
    console.log('VI images:', viImgs.length, viImgs);
    console.log('EN images:', enImgs.length, enImgs);
  });
});
