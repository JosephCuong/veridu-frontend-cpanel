/**
 * Script nạp toàn bộ dữ liệu Giáo Lý Phần I (CCC 26 - 1065) vào Supabase
 * Thông qua endpoint an toàn /api/admin/catechism/import
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SEED_FILE = path.join(__dirname, 'catechism_part1_seed.json');
const TARGET_URL = 'https://www.cruxveritatis.org/api/admin/catechism/import';
const ADMIN_KEY = 'veridu-catechism-secure-seed-2026';
const CHUNK_SIZE = 50;

async function postBatch(paragraphs) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ paragraphs });
    const url = new URL(TARGET_URL);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300 && json.success) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout after 30s'));
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('🚀 Bắt đầu quá trình nạp Giáo Lý Phần I vào Supabase Production...');
  const rawData = fs.readFileSync(SEED_FILE, 'utf8');
  const allParagraphs = JSON.parse(rawData);
  console.log(`📦 Tổng số điều khoản cần xử lý: ${allParagraphs.length} điều khoản (CCC 26 - 1065)`);

  let totalInserted = 0;
  let totalUpdated = 0;

  for (let i = 0; i < allParagraphs.length; i += CHUNK_SIZE) {
    const chunk = allParagraphs.slice(i, i + CHUNK_SIZE);
    const rangeStr = `${chunk[0].paragraph_number} - ${chunk[chunk.length - 1].paragraph_number}`;
    process.stdout.write(`⏳ Đang nạp nhóm [${i + 1} - ${i + chunk.length}] (Số ${rangeStr})... `);

    try {
      const result = await postBatch(chunk);
      totalInserted += (result.inserted || 0);
      totalUpdated += (result.updated || 0);
      console.log(`✅ Thành công! (Thêm mới: ${result.inserted}, Cập nhật: ${result.updated})`);
    } catch (err) {
      console.error(`❌ Thất bại: ${err.message}`);
      console.log('Tạm dừng 2s rồi thử lại...');
      await new Promise(r => setTimeout(r, 2000));
      try {
        const retryResult = await postBatch(chunk);
        totalInserted += (retryResult.inserted || 0);
        totalUpdated += (retryResult.updated || 0);
        console.log(`✅ Thử lại thành công!`);
      } catch (retryErr) {
        console.error(`💥 Thử lại vẫn thất bại: ${retryErr.message}`);
      }
    }

    // Delay 300ms giữa các batch để tránh overload rate limit
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n======================================================');
  console.log(`🎉 HOÀN TẤT NẠP GIÁO LÝ PHẦN I VÀO SUPABASE!`);
  console.log(`- Điều khoản mới nạp vào: ${totalInserted}`);
  console.log(`- Điều khoản được cập nhật: ${totalUpdated}`);
  console.log('======================================================\n');
}

run();
