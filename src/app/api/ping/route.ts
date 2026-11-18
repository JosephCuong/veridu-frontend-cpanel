import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('pong', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=15, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=15, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
