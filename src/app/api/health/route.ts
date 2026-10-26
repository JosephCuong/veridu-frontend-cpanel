import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  try {
    const dbStart = Date.now();
    // Safety timeout: 2500ms max for database ping to ensure health endpoint NEVER times out
    const dbPromise = supabase.from('posts').select('id').limit(1);
    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Database ping timeout (>2500ms)')), 2500)
    );

    const result = await Promise.race([dbPromise, timeoutPromise]) as any;
    dbLatencyMs = Date.now() - dbStart;

    if (result.error) {
      dbStatus = 'degraded';
      dbError = result.error.message;
    }
  } catch (err: any) {
    dbStatus = 'degraded';
    dbError = err.message || 'Database connection error';
  }

  const totalDurationMs = Date.now() - startTime;
  const isHealthy = dbStatus === 'healthy';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      totalDurationMs,
      services: {
        webServer: {
          status: 'operational',
          region: process.env.VERCEL_REGION || 'local',
          environment: process.env.NODE_ENV || 'production',
        },
        database: {
          status: dbStatus,
          provider: 'Supabase (PostgreSQL)',
          latencyMs: dbLatencyMs,
          error: dbError,
        },
      },
      endpoints: {
        sitemap: '/sitemap.xml',
        ping: '/api/ping',
        library: '/thu-vien',
        courses: '/khoa-hoc',
      },
    },
    {
      status: 200, // Always return 200 so Uptime monitors don't trigger false alerts during minor latency spikes
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'X-Response-Time': `${totalDurationMs}ms`,
      },
    }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
