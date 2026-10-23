const https = require('https');

// 1. Fetch current post 54
const getOptions = {
  hostname: 'cljglzhuwdniynfkzkxc.supabase.co',
  path: '/rest/v1/posts?id=eq.54&select=id,title,title_en,slug,content,content_en',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI'
  }
};

https.get(getOptions, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', async () => {
    const post = JSON.parse(data)[0];
    if (!post) {
      console.error('Post 54 not found');
      return;
    }

    console.log('Synchronizing images for Post 54:', post.title);

    // VI Google Drive CDN images
    const viImages = [
      'https://lh3.googleusercontent.com/d/1sESDSI0yAeMaBA74X4KFeIOAo3xoOWDE',
      'https://lh3.googleusercontent.com/d/15pMOYUk35fW-HhKrzeJGGw6NHaRSiTh7',
      'https://lh3.googleusercontent.com/d/1YRPFHssUCrG5yq4JF9-u805HqPqi01PR',
      'https://lh3.googleusercontent.com/d/16nmwS39S8DRBAcas7qeg1zqeN9P4T-oS'
    ];

    let enContent = post.content_en;

    // Replace the 4 dummy unsplash image URLs sequentially in enContent
    let imgIdx = 0;
    enContent = enContent.replace(
      /https:\/\/images\.unsplash\.com\/photo-1548625361-9c8eb25c56df\?[^"'\s>]+/gi,
      (match) => {
        if (imgIdx < viImages.length) {
          const replacement = viImages[imgIdx];
          console.log(`Replacing dummy image ${imgIdx + 1} with: ${replacement}`);
          imgIdx++;
          return replacement;
        }
        return match;
      }
    );

    // Also update any data-image-url attributes if present
    imgIdx = 0;
    enContent = enContent.replace(
      /data-image-url=["'][^"']*unsplash[^"']*["']/gi,
      (match) => {
        if (imgIdx < viImages.length) {
          const replacement = `data-image-url="${encodeURIComponent(viImages[imgIdx])}"`;
          imgIdx++;
          return replacement;
        }
        return match;
      }
    );

    console.log('Sending update to /api/posts/update on cruxveritatis.org...');
    const payload = JSON.stringify({
      id: 54,
      title: post.title,
      slug: post.slug,
      content: post.content,
      content_en: enContent,
      status: 'published'
    });

    const updateOptions = {
      hostname: 'www.cruxveritatis.org',
      port: 443,
      path: '/api/posts/update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 30000
    };

    const req = https.request(updateOptions, (updateRes) => {
      let respBody = '';
      updateRes.on('data', c => respBody += c);
      updateRes.on('end', () => {
        console.log('Status:', updateRes.statusCode);
        console.log('Response:', respBody);
        if (updateRes.statusCode === 200) {
          console.log('🎉 Post 54 English translation successfully synchronized with Google Drive CDN images!');
        }
      });
    });

    req.on('error', console.error);
    req.write(payload);
    req.end();
  });
}).on('error', console.error);
