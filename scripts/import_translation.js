/**
 * VERIDU Translation Ingestion CLI (1-Click English Ingestion)
 * Usage:
 *   node scripts/import_translation.js --id 55 --file "path/to/article-en.html"
 *   node scripts/import_translation.js --slug ngai-den-the-gian-dang-toan-nang-tren-doi-so --file "path/to/article-en.html"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      params[key] = val;
    }
  }

  // Positional fallback: node import_translation.js <ID_OR_SLUG> <FILE_PATH>
  if (!params.id && !params.slug && args.length >= 2) {
    if (!isNaN(Number(args[0]))) {
      params.id = Number(args[0]);
    } else {
      params.slug = args[0];
    }
    params.file = args[1];
  }

  return params;
}

function extractMetadata(html) {
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

  const subMatch = html.match(/class=["'][^"']*article-subtitle[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  const subtitle = subMatch ? subMatch[1].replace(/<[^>]+>/g, '').trim() : '';

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    || html.match(/class=["'][^"']*abstract-body[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  const excerpt = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 200) : subtitle;

  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  const content = articleMatch ? articleMatch[0] : html;

  return { title, subtitle, excerpt, content };
}

async function run() {
  const params = parseArgs();

  if (!params.file || (!params.id && !params.slug)) {
    console.log(`
=============================================================
  VERIDU 1-CLICK TRANSLATION INGESTION TOOL
=============================================================
Cú pháp lệnh:
  node scripts/import_translation.js --id <POST_ID> --file "<DUONG_DAN_HTML>"
  node scripts/import_translation.js --slug <SLUG> --file "<DUONG_DAN_HTML>"

Ví dụ:
  node scripts/import_translation.js --id 55 --file "D:/AGENT-VERIDU/NGHIÊN CỨU MỚI/BAI_VIET_XUAT_BAN/Ngai_Den_The_Gian_Dang_Toan_Nang_Tren_Doi_So/ngai-den-the-gian-dang-toan-nang-tren-doi-so-en.html"
=============================================================
`);
    process.exit(1);
  }

  const filePath = path.resolve(params.file);
  if (!fs.existsSync(filePath)) {
    console.error(`[Lỗi] Tệp không tồn tại: ${filePath}`);
    process.exit(1);
  }

  console.log(`[1/3] Đang đọc tệp bản dịch: ${filePath}...`);
  const rawHtml = fs.readFileSync(filePath, 'utf8');
  const { title, excerpt, content } = extractMetadata(rawHtml);

  console.log(`[2/3] Trích xuất siêu dữ liệu:`);
  console.log(`  - Tiêu đề EN : "${title}"`);
  console.log(`  - Tóm tắt EN : "${excerpt.slice(0, 90)}..."`);
  console.log(`  - Độ dài nội dung: ${content.length} ký tự`);

  // Detect companion study_cards.json in the same directory
  let enrichedContent = content;

  // Archaeological Figures in Section III with English Captions
  const boatFigureHtml = `
  <figure class="wp-block-image veridu-image-block">
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Jesus_Boat_Ginosar.jpg/1280px-Jesus_Boat_Ginosar.jpg" 
      alt="1st-Century Ancient Galilee Boat (Yigal Allon Museum)" 
      data-lightbox="true" 
      loading="lazy" 
    />
    <figcaption class="image-caption">
      The 1st-century ancient fishing boat discovered on the shores of the Sea of Galilee (Yigal Allon Centre, Kibbutz Ginosar), offering vivid archaeological testimony to the maritime setting where terrified disciples witnessed their Master's sovereign power calming the tempest (Mt 8:26).
    </figcaption>
  </figure>`;

  const tabghaFigureHtml = `
  <figure class="wp-block-image veridu-image-block">
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Tabgha_Mosaic_Loaves_and_Fish.jpg/1280px-Tabgha_Mosaic_Loaves_and_Fish.jpg" 
      alt="5th-Century Tabgha Mosaic of the Loaves and Fish" 
      data-lightbox="true" 
      loading="lazy" 
    />
    <figcaption class="image-caption">
      5th-century mosaic of the Loaves and Fish at Tabgha (Church of the Multiplication, Israel), a millennium-old monument of liturgical art honoring Jesus as the One who feeds the multitudes and reveals Himself as the true Bread of Life (Jn 6:35).
    </figcaption>
  </figure>`;

  if (!enrichedContent.includes('Jesus_Boat_Ginosar') && enrichedContent.includes('<strong>1. Sovereign Dominion Over the Waters:</strong>')) {
    enrichedContent = enrichedContent.replace(
      '<strong>1. Sovereign Dominion Over the Waters:</strong>',
      `${boatFigureHtml}\n    <p><strong>1. Sovereign Dominion Over the Waters:</strong>`
    );
  }

  if (!enrichedContent.includes('Tabgha_Mosaic_Loaves_and_Fish') && enrichedContent.includes('<strong>2. Provider of the Bread of Life in the Desert:</strong>')) {
    enrichedContent = enrichedContent.replace(
      '<strong>2. Provider of the Bread of Life in the Desert:</strong>',
      `${tabghaFigureHtml}\n    <p><strong>2. Provider of the Bread of Life in the Desert:</strong>`
    );
  }

  const companionDeckPath = path.join(path.dirname(filePath), 'study_cards.json');
  if (fs.existsSync(companionDeckPath) && !enrichedContent.includes('veridu-study-deck-section')) {
    try {
      const studyCards = JSON.parse(fs.readFileSync(companionDeckPath, 'utf8'));
      if (studyCards && studyCards.cards) {
        console.log(`  - Tìm thấy tệp bổ trợ study_cards.json: Đang tự động nhúng Bộ thẻ & Trắc nghiệm Tiếng Anh...`);
        let studyCardsHtml = `
  <!-- Concept Study Cards & Interactive Quiz Section -->
  <div class="veridu-study-deck-section" style="margin: 3rem 0; padding: 2rem; background: linear-gradient(135deg, rgba(197, 155, 39, 0.08) 0%, rgba(139, 38, 38, 0.05) 100%); border-radius: 1.5rem; border: 1px solid rgba(197, 155, 39, 0.3);">
    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
      <span style="font-size: 1.75rem;">🎴</span>
      <h3 id="study-deck" style="margin: 0; font-family: var(--font-serif); font-size: 1.4rem; color: #8b2626; font-weight: 700;">
        ${studyCards.deck_title_en || 'Concept Study Cards & Interactive Quiz'}
      </h3>
    </div>
    <div class="veridu-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">`;

        studyCards.cards.forEach((c, idx) => {
          studyCardsHtml += `
      <details style="background: #ffffff; border: 1px solid #e2d9cc; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <summary style="font-weight: 700; color: #2b2823; cursor: pointer; display: flex; justify-content: space-between;">
          <span>Card #${idx + 1}: ${c.term_en || c.term_vi}</span>
          <span style="color: #c59b27; font-size: 0.85rem;">[Details]</span>
        </summary>
        <div style="margin-top: 1rem; font-size: 0.92rem; line-height: 1.6; color: #444;">
          <p><strong>Original:</strong> <em>${c.original_language || ''}</em></p>
          <p><strong>Etymology &amp; Meaning:</strong> ${c.etymology_meaning_en || c.etymology_meaning_vi || ''}</p>
          <p><strong>Theology:</strong> ${c.theological_lesson_en || c.theological_lesson_vi || ''}</p>
        </div>
      </details>`;
        });

        studyCardsHtml += `</div></div>`;

        if (enrichedContent.includes('<div class="veridu-faq-section">')) {
          enrichedContent = enrichedContent.replace('<div class="veridu-faq-section">', `${studyCardsHtml}\n\n  <div class="veridu-faq-section">`);
        } else {
          enrichedContent += studyCardsHtml;
        }
      }
    } catch (e) {
      console.warn('Lỗi khi đọc companion deck:', e.message);
    }
  }

  const payloadData = {
    title_en: title,
    excerpt_en: excerpt,
    content_en: enrichedContent,
    available_languages: ['vi', 'en']
  };

  if (params.id) payloadData.id = Number(params.id);
  if (params.slug) payloadData.slug = String(params.slug).trim();

  const payload = JSON.stringify(payloadData);
  console.log(`[3/3] Đang nạp bản dịch lên hệ thống Production qua API /api/posts/update (${Buffer.byteLength(payload)} bytes)...`);

  const req = https.request({
    hostname: 'www.cruxveritatis.org',
    port: 443,
    path: '/api/posts/update',
    method: 'POST',
    family: 4,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 45000
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`\n=============================================================`);
        console.log(`🎉 NẠP BẢN DỊCH TIẾNG ANH THÀNH CÔNG RỰC RỠ (Status 200 OK)!`);
        console.log(`=============================================================`);
        const enSlug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
        console.log(`👉 Link Tiếng Anh Trực Tuyến: https://www.cruxveritatis.org/en/${enSlug}`);
      } else {
        console.error(`[Lỗi] API trả về mã lỗi HTTP ${res.statusCode}:`, body);
      }
    });
  });

  req.on('error', (err) => console.error('[Lỗi kết nối]:', err.message));
  req.write(payload);
  req.end();
}

run();
