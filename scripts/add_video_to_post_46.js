const https = require('https');

async function updatePostWithVideo() {
  const targetUrl = 'https://www.cruxveritatis.org';
  
  // 1. Fetch current post
  console.log('Fetching post #46...');
  const res = await fetch(`${targetUrl}/api/posts/get?slug=thanh-gierusalem-thoi-vua-khon-ngoan-salomon-va-de-nhat-den-tho`);
  const data = await res.json();
  
  if (!data.post) {
    throw new Error('Post not found');
  }

  const post = data.post;
  console.log('Found post:', post.title);

  const videoUrl = 'https://youtu.be/OBnqjOSmBDI';
  const embedUrl = 'https://www.youtube.com/embed/OBnqjOSmBDI';
  const caption = 'Phim Tài Liệu Khảo Cứu: Đền Thờ Giê-ru-sa-lem — Lịch Sử và Ý Nghĩa';
  const author = 'VERIDU';
  const sourceUrl = 'https://www.youtube.com/@veridu.net-gmail';
  const license = 'Kênh Chính Thức VERIDU';
  const licenseUrl = 'https://www.youtube.com/@veridu.net-gmail';

  const videoBlockHtml = `
    <!-- VIDEO KHẢO CỨU: ĐỀN THỜ GIÊRUSALEM (VERIDU) -->
    <div class="veridu-embed-video my-8 not-prose" data-veridu-block="video" data-video-url="${encodeURIComponent(videoUrl)}" data-aspect-ratio="16:9" data-caption="${encodeURIComponent(caption)}" data-author="${encodeURIComponent(author)}" data-source-url="${encodeURIComponent(sourceUrl)}" data-license="${encodeURIComponent(license)}" data-license-url="${encodeURIComponent(licenseUrl)}">
      <div class="aspect-video w-full rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-card)] bg-black relative z-10 transition-all">
        <iframe src="${embedUrl}" class="w-full h-full border-none rounded-3xl" title="${caption}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <figcaption class="mt-3 text-center text-xs font-serif text-[var(--text-muted)] space-y-1.5 max-w-xl mx-auto">
        <span class="block text-slate-300 font-medium italic">${caption}</span>
        <span class="inline-flex items-center justify-center flex-wrap gap-1.5 text-[11px] text-[var(--text-muted)] opacity-85">
          <span>Kênh sản xuất: <strong class="text-amber-500 font-semibold">${author}</strong></span>
          <span>•</span>
          <a href="${licenseUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 font-bold inline-flex items-center gap-1">
            <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span>@veridu.net-gmail</span>
          </a>
          <span>•</span>
          <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 inline-flex items-center gap-0.5 text-slate-400 hover:underline"><span>Xem trên YouTube</span><span class="text-[10px]">↗</span></a>
        </span>
      </figcaption>
    </div>
`;

  let content = post.content || '';
  if (content.includes('OBnqjOSmBDI')) {
    console.log('Video already exists in post content. Skipping duplicate insertion.');
  } else {
    const targetAnchor = '<veridu-timeline-placeholder></veridu-timeline-placeholder>';
    if (content.includes(targetAnchor)) {
      content = content.replace(targetAnchor, `${targetAnchor}\n${videoBlockHtml}\n`);
      console.log('Successfully inserted video block after timeline placeholder.');
    } else {
      const abstractAnchor = '</div>\n\n    <!-- PHẦN I';
      if (content.includes(abstractAnchor)) {
        content = content.replace(abstractAnchor, `</div>\n${videoBlockHtml}\n\n    <!-- PHẦN I`);
        console.log('Successfully inserted video block after abstract block.');
      } else {
        content = videoBlockHtml + '\n' + content;
        console.log('Prepended video block to content.');
      }
    }
  }

  // 2. Call /api/posts/update
  console.log('Sending update to /api/posts/update...');
  const updatePayload = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: content,
    video_url: videoUrl,
    status: 'published'
  };

  const updateRes = await fetch(`${targetUrl}/api/posts/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  });

  const updateResult = await updateRes.json();
  console.log('Update result status:', updateRes.status, 'Response:', updateResult);

  if (updateResult.success) {
    console.log('🎉 Article #46 successfully updated with YouTube video!');
  } else {
    console.error('Update failed:', updateResult);
  }
}

updatePostWithVideo().catch(console.error);
