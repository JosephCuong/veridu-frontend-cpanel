const https = require('https');

const options = {
  hostname: 'cljglzhuwdniynfkzkxc.supabase.co',
  path: '/rest/v1/posts?id=eq.54&select=id,title,content,content_en',
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
    const viFigures = (p.content || '').match(/<figure[\s\S]*?<\/figure>/gi) || [];
    const enFigures = (p.content_en || '').match(/<figure[\s\S]*?<\/figure>/gi) || [];

    console.log('VI Figures:', viFigures.length);
    viFigures.forEach((f, i) => {
      const src = f.match(/src=["']([^"']+)["']/i)?.[1];
      const cap = f.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
      console.log(`[VI Figure ${i + 1}]:\n  SRC: ${src}\n  CAP: ${cap}\n`);
    });

    console.log('EN Figures:', enFigures.length);
    enFigures.forEach((f, i) => {
      const src = f.match(/src=["']([^"']+)["']/i)?.[1];
      const cap = f.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
      console.log(`[EN Figure ${i + 1}]:\n  SRC: ${src}\n  CAP: ${cap}\n`);
    });
  });
});
