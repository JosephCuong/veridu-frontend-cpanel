const fs = require('fs');
const path = require('path');
const https = require('https');

const SEED_FILE = path.join(__dirname, 'matthew_course_seed.json');
const TARGET_URL = 'https://www.cruxveritatis.org/api/courses/save';

async function importCourse() {
  const rawData = fs.readFileSync(SEED_FILE, 'utf8');
  const payload = JSON.parse(rawData);

  console.log(`Starting import for course: ${payload.course.title}`);
  console.log(`Total lessons: ${payload.course.lessons.length}`);

  const postData = JSON.stringify(payload);
  const url = new URL(TARGET_URL);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 60000
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log('Server response:', json);
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
      reject(new Error('Request timeout after 60s'));
    });

    req.write(postData);
    req.end();
  });
}

importCourse()
  .then(res => console.log('Successfully completed import!'))
  .catch(err => console.error('Import failed:', err));
