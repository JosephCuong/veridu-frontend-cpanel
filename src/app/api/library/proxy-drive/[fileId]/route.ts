import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId;
    if (!fileId) {
      return NextResponse.json({ error: 'Thiếu Google Drive fileId' }, { status: 400 });
    }

    // Direct download url from Google Drive
    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Step 1: Initial fetch to handle large file (>25MB) virus scan confirmation
    const initialRes = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    const contentType = initialRes.headers.get('content-type') || '';

    // If Google returned HTML, it might be the virus scan warning for files >25MB
    if (contentType.includes('text/html')) {
      const htmlText = await initialRes.text();
      
      // Look for confirmation token in html: confirm=xxxx or download form
      let confirmToken = '';
      const confirmMatch = htmlText.match(/confirm=([0-9A-Za-z_-]+)/);
      if (confirmMatch && confirmMatch[1]) {
        confirmToken = confirmMatch[1];
      } else {
        const formMatch = htmlText.match(/name="confirm"\s+value="([^"]+)"/);
        if (formMatch && formMatch[1]) {
          confirmToken = formMatch[1];
        }
      }

      if (confirmToken) {
        // Step 2: Fetch with confirm token and forward cookies if present
        const confirmedUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
        const confirmedRes = await fetch(confirmedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          redirect: 'follow',
        });

        const headers = new Headers();
        headers.set('Content-Type', confirmedRes.headers.get('content-type') || 'application/pdf');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
        headers.set('Content-Disposition', `inline; filename="${fileId}.pdf"`);

        const len = confirmedRes.headers.get('content-length');
        if (len) headers.set('Content-Length', len);

        return new NextResponse(confirmedRes.body as any, {
          status: 200,
          headers,
        });
      }
    }

    // Step 3: Direct binary stream if not an HTML warning
    const headers = new Headers();
    headers.set('Content-Type', initialRes.headers.get('content-type') || 'application/pdf');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    headers.set('Content-Disposition', `inline; filename="${fileId}.pdf"`);

    const len = initialRes.headers.get('content-length');
    if (len) headers.set('Content-Length', len);

    return new NextResponse(initialRes.body as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Lỗi khi proxy Google Drive stream:', err);
    return NextResponse.json({ error: 'Không thể truyền tải tệp từ Google Drive' }, { status: 500 });
  }
}
