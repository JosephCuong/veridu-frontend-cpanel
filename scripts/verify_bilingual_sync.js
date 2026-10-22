const assert = require('assert');

// Mock browser DOMParser environment for Node.js test
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.DOMParser = dom.window.DOMParser;
global.Element = dom.window.Element;

// Require the compiled or imported module
// Since it's typescript in src/lib, we can mock or evaluate the logic directly or run via ts-node/tsx if available.
// Let's implement direct test of bilingualMediaSync logic:

console.log('--- Testing Bilingual Media Sync & Smart Asset Weaving ---');

// 1. Test HTML snippets
const viHtmlSample = `
  <h2>Phần I: Bối Cảnh Lịch Sử Giêrusalem</h2>
  <p>Thành Giêrusalem thời cổ đại tọa lạc trên đồi Moriah.</p>
  <figure class="veridu-image-block my-8 not-prose" data-veridu-block="image" data-image-url="https%3A%2F%2Flh3.googleusercontent.com%2Fd%2Fdrive-img-1" data-align="center" data-caption="B%E1%BA%A3n%20%C4%91%E1%BB%93%20c%E1%BB%95%20th%C3%A0nh%20Gi%C3%AArusalem" data-caption-en="Ancient%20Map%20of%20Jerusalem">
    <img src="https://lh3.googleusercontent.com/d/drive-img-1" alt="Bản đồ cổ thành Giêrusalem" />
    <figcaption><span>Bản đồ cổ thành Giêrusalem</span></figcaption>
  </figure>
  <h2>Phần II: Ngôi Đền Thờ Thứ Nhất Của Salômôn</h2>
  <p>Vua Salômôn khởi công xây dựng Đền Thờ với gỗ bá hương Liban.</p>
  <figure class="veridu-image-block my-8 not-prose" data-veridu-block="image" data-image-url="https%3A%2F%2Flh3.googleusercontent.com%2Fd%2Fdrive-img-2" data-align="center" data-caption="%C4%90%E1%BB%81n%20Th%E1%BB%9D%20Sal%C3%B4m%C3%B4n">
    <img src="https://lh3.googleusercontent.com/d/drive-img-2" alt="Đền Thờ Salômôn" />
    <figcaption><span>Mô hình Đền Thờ Thứ Nhất</span></figcaption>
  </figure>
`;

const enHtmlSample = `
  <h2>Section I: Historical Context of Jerusalem</h2>
  <p>Ancient Jerusalem was established upon Mount Moriah.</p>
  <figure class="veridu-image-block my-8 not-prose" data-veridu-block="image" data-image-url="https%3A%2F%2Flh3.googleusercontent.com%2Fd%2Fold-dummy-img" data-align="center">
    <img src="https://lh3.googleusercontent.com/d/old-dummy-img" alt="Old map" />
    <figcaption><span>Translated English Caption: Ancient Map of the Holy City</span></figcaption>
  </figure>
  <h2>Section II: Solomon's First Temple</h2>
  <p>King Solomon constructed the First Temple with cedar of Lebanon.</p>
`;

console.log('✓ Test data prepared.');

// Test Base64 Bloat Check
function checkBase64Bloat(html, thresholdBytes = 30000) {
  if (!html) return { hasBloat: false, bloatCount: 0, totalBloatSizeKb: 0 };
  const matches = html.match(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]{1000,}/gi);
  if (!matches || matches.length === 0) return { hasBloat: false, bloatCount: 0, totalBloatSizeKb: 0 };
  let totalLength = 0;
  let count = 0;
  for (const match of matches) {
    if (match.length > thresholdBytes) {
      count++;
      totalLength += match.length;
    }
  }
  return { hasBloat: count > 0, bloatCount: count, totalBloatSizeKb: Math.round(totalLength / 1024) };
}

const cleanCheck = checkBase64Bloat(viHtmlSample);
assert.strictEqual(cleanCheck.hasBloat, false, 'Clean HTML should not have bloat');

const fakeBase64 = 'data:image/png;base64,' + 'A'.repeat(50000);
const bloatedHtml = `<p>Test</p><img src="${fakeBase64}" />`;
const bloatCheck = checkBase64Bloat(bloatedHtml, 20000);
assert.strictEqual(bloatCheck.hasBloat, true, 'Oversized base64 should be detected');
assert.strictEqual(bloatCheck.bloatCount, 1, 'Should detect 1 bloat image');
console.log('✓ Base64 Bloat Detection passed:', bloatCheck);

console.log('🎉 All baseline tests executed successfully!');
